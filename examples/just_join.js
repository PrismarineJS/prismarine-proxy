const { makeProxy } = require('../index')
const proxy = makeProxy({ host: '95.111.249.143', port: 10000, version: '1.12.2' }, {}, toClient, toServer)

function toClient ({ data, meta }) {
  if (meta.name === 'chat') {
    console.log(proxy)
    console.log('Chat message received')
  }
  return { data, meta }
}

function toServer ({ data, meta }) {
  if (meta.name === 'chat') {
    console.log('Chat message sent')
  }
  return { data, meta }
}
