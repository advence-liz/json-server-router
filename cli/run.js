const jsonServer = require('json-server')
const { blue, red, green, bgRed } = require('chalk')

const JsonServerRouter = require('../index')

/**
 * @prop {string} root mock文件根目录默认为 'mock'
 * @prop {number} port 端口号跟json-server 一致
 * @prop {string} publicPath 生成默认首页的地址，跟json-server 一致默认为 'public'
 */

module.exports = function run (opts) {
  const { root, host, port, open } = opts
  const middlewares = jsonServer.defaults({
    bodyParser: true,
    static: 'public'
  })
  const app = jsonServer.create({ port, host })
  const router = new JsonServerRouter({
    root,
    host,
    port,
    open,
    publicPath: 'public'
  })

  app.use(middlewares)
  console.count('router')
  // app.use(jsonServer.bodyParser)
  // https://github.com/typicode/json-server/issues/453
  // app.use(function (req, res, next) {
  //   if (req.method === 'POST') {
  //     // Converts POST to GET and move payload to query params
  //     // This way it will make JSON Server that it's GET request
  //     req.method = 'GET'
  //     req.query = req.body
  //   }
  //   // Continue to JSON Server router
  //   next()
  // })
  app.use(router.routes())
  // app.use(router.rewrite())

  const server = app.listen(port, () => {
    // console.info(`输入rs重新启动mock server`)
  })
  process.on('uncaughtException', error => {
    if (error.errno === 'EADDRINUSE') {
      console.log(
        red(
          `Cannot bind to the port ${
            error.port
          }. Please specify another port number either through --port argument or through the json-server.json configuration file`
        )
      )
    } else console.log('Some error occurred', error)
    process.exit(1)
  })

  const sockets = []
  server.on('connection', function (socket) {
    sockets.push(socket)
    socket.once('close', function () {
      sockets.splice(sockets.indexOf(socket), 1)
    })
  })

  // 关闭之前，我们需要手动清理连接池中得socket对象
  server.closeServer = () => {
    sockets.forEach(function (socket) {
      socket.destroy()
    })
    server.close(function () {
      console.log('close server!')
    })
  }
  return server
}
