const EventEmitter = require('events')
const { createServer, createClient } = require('minecraft-protocol')
const PLAY_STATE = 'play'
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
    toClient.write('login', {
      entityId: toClient.id,
      gameMode: 0,
      dimension: 0,
      difficulty: 1,
      maxPlayers: 20,
      levelType: 'default',
      reducedDebugInfo: false
    })

    const toServer = createClient({
      ...this.options.clientOptions,
      keepAlive: false,
      ...this.options.loginHandler(toClient)
    })

    this.toServerClients.set(toClient.id, toServer)

    toServer.on('login', (data) => {
      if (!this.clientIsOnline(toClient)) return
      this.emit('start', toClient, toServer)
      const dimension = data.dimension === 0 ? -1 : 0
      toClient.write('respawn', {
        dimension,
        difficulty: data.difficulty,
        gamemode: data.gameMode,
        levelType: data.levelType
      })
      toClient.write('respawn', {
        dimension: data.dimension,
        difficulty: data.difficulty,
        gamemode: data.gameMode,
        levelType: data.levelType
      })
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
