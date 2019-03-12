const debug = require('debug')('jsr:cli')
const path = require('path')
let config = {}
try {
  config = require(path.resolve('./jsr.config.js'))
} catch (error) {
  debug(error)
}
const handler = (req, res, next) => {
  const { ip, originalUrl, body } = req
  res.json({
    code: 0,
    message: 'succeed',
    cookie: req.get('cookie'),
    ip,
    url: originalUrl,
    body: body
  })
}
const queryMap = []
module.exports = {
  ...{
    handler,
    queryMap,
    ...config
  }
}
