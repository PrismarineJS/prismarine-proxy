const { InstantConnectProxy } = require('prismarine-proxy')
const proxy = new InstantConnectProxy({
  loginHandler: (client) => {
    if (client.username === 'U9G') return { username: 'john', auth: 'microsoft' }
    else return { username: client.username, auth: 'microsoft' }
  },
  clientOptions: {
    host: 'localhost',
    version: '1.18.2'
  },
  serverOptions: {
    version: '1.18.2',
    port: 25566
  }
})

proxy.on('incoming', (data, meta, toClient, toServer) => {
  toClient.write(meta.name, data)
})

proxy.on('outgoing', (data, meta, toClient, toServer) => {
  toServer.write(meta.name, data)
})
