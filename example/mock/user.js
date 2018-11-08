const _ = require('lodash')
const { Random } = require('mockjs')
module.exports = {
  list: _.times(10, index => ({
    id: index,
    name: Random.name()
  }))
}
