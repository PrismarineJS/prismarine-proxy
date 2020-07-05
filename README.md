# prismarine-proxy

[![NPM version](https://img.shields.io/npm/v/prismarine-proxy.svg)](http://npmjs.com/package/prismarine-proxy)
[![Build Status](https://github.com/PrismarineJS/prismarine-proxy/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-proxy/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)

[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/prismarine-proxy)


Provide features to build proxies using Prismarine modules

## Roadmap

Provide features to build low and high level proxies, see https://github.com/PrismarineJS/node-minecraft-protocol/issues/712 for details.

Example of use case :
* client side proxies :
  * make yourself a bot : do pathfinding like a bot, auto dig things, ...
  * share your world view with a friend using prismarine-view
* server side proxies :
  * act as a proxy with many vanilla client servers, with portals or commands to switch
  * change things in server behavior : forbid going to some places, change the blocks, ...

The idea for this repo is for people to add example, and piece by piece build a lib that make sense for various use cases, while trying to use
and improve mineflayer, flying-squid and the prismarine components.

## Usage

Checkout examples/

* examples/simple_example.js is https://github.com/PrismarineJS/node-minecraft-protocol/tree/master/examples/proxy

