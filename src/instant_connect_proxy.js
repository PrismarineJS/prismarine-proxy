const EventEmitter = require('events')
const { createServer, createClient } = require('minecraft-protocol')
const packets = require('minecraft-packets').pc
const mcDataLoader = require('minecraft-data')
const PLAY_STATE = 'play'
const verMap = {
  '1.8.9': '1.8.8'
}

function getPacket (ver, name, mcData) {
  let packet = packets[ver]?.['from-server']?.[name][0].json
  if (name === 'login') {
    packet = packet ?? mcData.loginPacket
  }
  if (!packet) throw new Error(`Packets for version ${ver} aren't stored. This can be fixed by adding them to the verMap if similar packets are stored.`)
  return packet
}

class InstantConnectProxy extends EventEmitter {
  constructor (options) {
    super()
    this.options = options
    this.toServerClients = new Map()
    this.server = createServer({
      'online-mode': true,
      keepAlive: false,
      ...this.options.serverOptions
    })
    this.server.on('login', client => this.onLogin(client))
  }

  onLogin (toClient) {
    // until the proxyClient logs in, lets send a login packet
    const mcData = mcDataLoader(toClient.version)
    const mcVersion = mcData.version.minecraftVersion
    const ver = verMap[mcVersion] ?? mcVersion
    toClient.write('login', { ...getPacket(ver, 'login', mcData), entityId: toClient.id })

    const toServer = createClient({
      ...this.options.clientOptions,
      keepAlive: false,
      ...this.options.loginHandler(toClient)
    })

    this.toServerClients.set(toClient.id, toServer)

    toServer.once('login', (data) => {
      if (!this.clientIsOnline(toClient)) return
      this.emit('start', toClient, toServer)
      // https://github.com/VelocityPowered/Velocity/blob/aa210b3544556c46776976cddc45deb4ace9bb68/proxy/src/main/java/com/velocitypowered/proxy/connection/client/ClientPlaySessionHandler.java#L437
      let dimension = data.dimension
      if (mcData.isOlderThan('1.16')) {
        dimension = data.dimension === 0 ? -1 : 0
      }
      toClient.write('respawn', { ...data, dimension })
      toClient.write('respawn', data)
    })

    toClient.on('packet', (data, meta) => {
      if (!this.clientIsOnline(toClient)) return
      if (toServer.state === PLAY_STATE && meta.state === PLAY_STATE) {
        this.emit('outgoing', data, meta, toClient, toServer)
      }
    })

    toServer.on('packet', (data, meta) => {
      if (!this.clientIsOnline(toClient)) return
      if (meta.name === 'disconnect') {
        toClient.write('kick_disconnect', data)
      }
      if (meta.state === PLAY_STATE && toClient.state === PLAY_STATE) {
        if (meta.name === 'set_compression') {
          toClient.compressionThreshold = data.threshold // Set compression
          return
        }
        this.emit('incoming', data, meta, toClient, toServer)
      }
    })

    toClient.once('end', () => {
      this.emit('end', toServer.username)
      this.endClient(toClient)
    })
  }

  endClient (client) {
    this.toServerClients.get(client.id)?.end()
    this.toServerClients.delete(client.id)
  }

  clientIsOnline (client) {
    return this.server?.clients[client.id] !== undefined
  }
}

module.exports = InstantConnectProxy
