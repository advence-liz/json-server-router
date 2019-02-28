const jsonServer = require('json-server')
const server = jsonServer.create()
const middlewares = jsonServer.defaults() // { static: 'public' }
const JsonServerRouter = require('../index')

/**
 * @prop {string} root mock文件根目录默认为 'mock'
 * @prop {number} port 端口号跟json-server 一致
 * @prop {string} publicPath 生成默认首页的地址，跟json-server 一致默认为 'public'
 */
const port = 3000
const router = new JsonServerRouter({
  root: 'mock',
  port,
  publicPath: 'public'
})

server.use(middlewares)
server.use(jsonServer.bodyParser)
// https://github.com/typicode/json-server/issues/453
// server.use(function (req, res, next) {
//   if (req.method === 'POST') {
//     // Converts POST to GET and move payload to query params
//     // This way it will make JSON Server that it's GET request
//     req.method = 'GET'
//     req.query = req.body
//   }
//   // Continue to JSON Server router
//   next()
// })
server.use(router.routes())
server.use(router.rewrite())

server.listen(port, () => {
  console.info(`JSON Server is running on ${port}`)
})
