const { makeProxy } = require('../index')
const proxy = makeProxy({ destination: { host: 'cosmicsky.com' }, version: '1.12.2' })

proxy.on('incoming', (data, meta) => {
  // write incoming packet to all clients
  for (const client of Object.values(proxy.clients)) {
    client.write(meta.name, data)
  }
})
// only send packets from first client that joins
proxy.once('client_connected', client => {
  client.on('outgoing', async (data, meta) => {
    proxy.targetClient.write(meta.name, data)
  })
})
