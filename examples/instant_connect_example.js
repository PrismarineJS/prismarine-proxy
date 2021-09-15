const { InstantConnectProxy } = require('prismarine-proxy')
const proxy = new InstantConnectProxy({
  loginHandler: (client) => {
    if (client.username === 'U9G') return { username: 'john' }
    else return { username: client.username }
  },
  clientOptions: {
    host: 'localhost',
    version: '1.8.9'
  },
  serverOptions: {
    version: '1.8.9'
  }
})

proxy.on('incoming', (data, meta, toClient, toServer) => {
  toClient.write(meta.name, data)
})

proxy.on('outgoing', (data, meta, toClient, toServer) => {
  toServer.write(meta.name, data)
})
