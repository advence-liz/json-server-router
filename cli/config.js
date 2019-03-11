const path = require('path')
const ip = require('ip')
let config = {}
try {
  config = require(path.resolve('./jsrrc.js'))
} catch (error) {
  console.log(error)
}
module.exports = {
  host: ip.address(),
  ...config
}
