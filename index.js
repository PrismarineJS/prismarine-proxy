const mc = require('minecraft-protocol')
const debug = require('debug')('prismarine-proxy')

/**
 * handleIncoming's signature is (packetData, packetMeta) => {} (expects an object returned with a data and a meta property)
 *
 * handleOutgoing's signature is (packetData, packetMeta) => {} (expects an object returned with a data and a meta property)
 * @param {{host: string, port: number, version?: string}} destination
 * @param {{host: string, port: number, version?: string}} localServer
 * @param {Function} handleIncoming
 * @param {Function} handleOutgoing
 * @returns {{toClient: import('minecraft-protocol').Client, toServer: import('minecraft-protocol').Server}}
 */
function makeProxy (destination = {}, localServer = {}, handleIncoming, handleOutgoing) {
  if (!destination.host) destination.host = 'localhost'
  if (!destination.port) destination.port = 25565
  if (!localServer.host) localServer.host = 'localhost'
  if (!localServer.port) localServer.port = 25566
  if (!localServer.version) localServer.version = destination.version
  const proxy = {}
  proxy.clients = {}

  proxy.server = mc.createServer({
    'online-mode': false,
    host: localServer.host,
    port: localServer.port,
    keepAlive: false,
    version: destination.version
  })

  proxy.server.on('login', (client) => {
    proxy.clients[Object.keys(proxy.clients).length] = client
    const addr = client.socket.remoteAddress
    debug('Incoming connection', '(' + addr + ')')
    let endedClient = false
    const endedTargetClient = false
    client.on('end', () => {
      endedClient = true
      debug('Connection closed by client', '(' + addr + ')')
      if (!endedTargetClient) { targetClient.end('End') }
    })
    client.on('error', (err) => {
      endedClient = true
      debug('Connection error by client', '(' + addr + ')')
      debug(err.stack)
      if (!endedTargetClient) { targetClient.end('Error') }
    })
    const targetClient = mc.createClient({
      host: destination.host,
      port: destination.port,
      version: destination.version,
      username: client.username,
      keepAlive: false
    })
    // outgoing packets
    client.on('packet', async (data, meta) => {
      if (targetClient.state === mc.states.PLAY && meta.state === mc.states.PLAY) {
        if (!endedTargetClient) {
          const newPacket = await handleOutgoing({ data, meta })
          targetClient.write(newPacket.meta.name, newPacket.data)
        }
      }
    })
    // incoming packets
    targetClient.on('packet', async (data, meta) => {
      if (meta.state === mc.states.PLAY && client.state === mc.states.PLAY) {
        if (!endedClient) {
          const newPacket = await handleIncoming({ data, meta })
          client.write(newPacket.meta.name, newPacket.data)
          if (meta.name === 'set_compression') {
            client.compressionThreshold = data.threshold
          }
        }
      }
    })
  })
  return proxy
}

module.exports = { makeProxy }
