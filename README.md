# prismarine-proxy

[![NPM version](https://img.shields.io/npm/v/prismarine-proxy.svg)](http://npmjs.com/package/prismarine-proxy)
[![Build Status](https://github.com/PrismarineJS/prismarine-proxy/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-proxy/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)

Provide features to build proxies using Prismarine modules

## Roadmap

Provide features to build low and high level proxies, see https://github.com/PrismarineJS/node-minecraft-protocol/issues/712 for details.

Example of use case :
* client side proxies :
  * make yourself a bot : do pathfinding like a bot, auto dig things, ...
  * share your world view with a friend using prismarine-viewer
* server side proxies :
  * act as a proxy with many vanilla client servers, with portals or commands to switch
  * change things in server behavior : forbid going to some places, change the blocks, ...

The idea for this repo is for people to add example, and piece by piece build a lib that make sense for various use cases, while trying to use
and improve mineflayer, flying-squid and the prismarine components.

## Usage

### InstantConnectProxy

This is a proxy that will allow you to instantly connect to the target, so you won't be able to send packets to the client before or after the client connects to the target server. This proxy only allows clients to connect to one server.

#### Usage

```js
const { InstantConnectProxy } = require('prismarine-proxy')

const login = 'my@email.com' // microsoft email or minecraft username

const proxy = new InstantConnectProxy({
  loginHandler: (client) => { // client object has a username object, so you can store usernames with their respective logins
    return { username: login, auth: 'microsoft' } // the login the proxy will connect to the server with
  },
  serverOptions: { // options for the local server shown to the vanilla client
    version: '1.8.9'
  },
  clientOptions: { // options for the client that will connect to the proxied server
    version: '1.8.9',
    host: 'hypixel.net' // server the proxy will connect to
  }
})

proxy.on('incoming', (data, meta, toClient, toServer) => { // packets incoming from the server to the client
  if (meta.name === 'world_particles') return // for 1.8.9, world_particles is the packet that contains particles, so by returning here, the client connected to the proxy won't get any particles
  toClient.write(meta.name, data) // otherwise send the packet to the client
})

proxy.on('outgoing', (data, meta, toClient, toServer) => { // packets outgoing from the client to the server
  if (meta.name === 'chat') console.log(data.message) // for 1.8.9, chat is the packet that the client sends to send a chat message to the server, so by using console.log, we can sniff the message before it hits the server, and even return early so it wouldn't hit the server
  toServer.write(meta.name, data) // otherwise send the packet to the client
})
```

Information about packets can be found [here](https://prismarinejs.github.io/minecraft-data/), make sure to select the minecraft version at the top, then click protocol.
