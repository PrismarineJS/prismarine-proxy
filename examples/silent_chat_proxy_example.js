const { InstantConnectProxy } = require('prismarine-proxy')

// change credentials here
const login = ['username', 'password']

const proxy = new InstantConnectProxy({

  // if you have a microsoft account use your email address as username and add "auth: microsoft" to clientOptions.
  // use "online-mode: false" to disable authentication (non premium servers)

  loginHandler: (client) => {
    return { username: login[0], password: login[1] }
  },

  // default port is 25565
  serverOptions: {
    version: '1.18.2',
    host: 'localhost'
  },
  clientOptions: {
    version: '1.18.2',
    host: 'hypixel.net'
  }
})

let silentchat = false
proxy.on('incoming', (data, meta, toClient, toServer) => {
  if (meta.name === 'chat' && silentchat) return

  toClient.write(meta.name, data)
})

proxy.on('outgoing', (data, meta, toClient, toServer) => {

  // sending back a chat packet to the client with the silentchat status
  // see: https://wiki.vg/Protocol#Chat_Message_.28clientbound.29 and https://minecraft-data.prismarine.js.org/?d=protocol#toClient_chat
  if (meta.name === 'chat' && data.message.startsWith('/silentchat')) {

    silentchat = !silentchat
    toClient.write('chat', { message: `{"text": "SilentChat set to: ${silentchat}"}`, position: 0, sender: 0 })
    return

  // block outgoing chat packets while in silent mode
  } else if (meta.name === 'chat' && silentchat) {

    toClient.write('chat', { message: '{"text": "SilentChat: Can\'t send messages while enabled!"}', position: 0, sender: 0 })
    return
  }

  toServer.write(meta.name, data)
})
