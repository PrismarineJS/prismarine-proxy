const mc = require('minecraft-protocol')
const debug = require('debug')('prismarine-proxy')
const EventEmitter = require('events')

// TODO: make autoversion for server version if the version isn't passed
function makeProxy ({
  destination: { host: destinationHost = 'localhost', port: destinationPort = 25565 } = {},
  proxy: { host: proxyHost = 'localhost', port: proxyPort = 25566 } = {},
  version = false
} = {}) {
  const proxy = new EventEmitter()
  proxy.version = version
  proxy.clients = {}

  proxy.proxyServer = mc.createServer({
    'online-mode': false,
    host: proxyHost,
    port: proxyPort,
    keepAlive: false,
    version: proxy.version
  })

  proxy.proxyServer.on('login', (client) => {
    const index = Object.keys(proxy.clients).length
    proxy.clients[index] = client
    proxy.emit('client_connected', client, index)
    const addr = client.socket.remoteAddress
    debug(`Incoming connection (${addr})`)
    let endedClient = false
    const endedTargetClient = false
    client.on('end', () => {
      endedClient = true
      debug(`Connection closed by client ${index} (${addr})`)
      if (!endedTargetClient) { proxy.targetClient.end('End') }
    })
    client.on('error', (err) => {
      endedClient = true
      debug(`Connection error by client (${addr})`)
      debug(err.stack)
      if (!endedTargetClient) { proxy.targetClient.end('Error') }
    })
    makeProxyServer()
    // if (index === 0) {
    // }
    // outgoing packets
    client.on('packet', async (data, meta) => {
      if (!(proxy.targetClient.state === mc.states.PLAY && meta.state === mc.states.PLAY) && !endedTargetClient) return
      client.emit('outgoing', data, meta)
    })
    function makeProxyServer () {
      proxy.targetClient = mc.createClient({
        host: destinationHost,
        port: destinationPort,
        version: proxy.version,
        username: client.username,
        keepAlive: false
      })

      // incoming packets
      proxy.targetClient.on('packet', async (data, meta) => {
        if (!(proxy.targetClient.state === mc.states.PLAY && meta.state === mc.states.PLAY) && !endedClient) return
        if (meta.name === 'set_compression') {
          client.compressionThreshold = data.threshold
        }
        proxy.emit('incoming', data, meta)
      })
    }
  })
  return proxy
}

module.exports = { makeProxy }
