const memdown = require('memdown')
const levelup = require('levelup')
const encode = require('encoding-down')

let increment = 0
module.exports = () => levelup(encode(memdown(increment++)))
