const jsonServer = require('json-server')
const path = require('path')
const fs = require('fs')
const { blue, red, green } = require('chalk')
const opn = require('opn')
const multer = require('multer')
const createTemplate = require('../lib/createTemplate')

const JsonServerRouter = require('../index')

/**
 * @param {Object} opts - The shape is the same as SpecialType above
 * @param {string} opts.root mock文件根目录默认为 'mock'
 * @param {number} opts.port 端口号跟json-server 一致
 * @param {string} opts.publicPath 生成默认首页的地址，跟json-server 一致默认为 'public'
 * @param {boolean} opts.open 是否默认打开浏览器
 */

module.exports = function createServer(opts, init) {
  const { root, host, port, open, static: publicPath, handler, queryMap } = opts
  const middlewares = jsonServer.defaults({
    bodyParser: true,
    static: publicPath
  })
  const app = jsonServer.create({ port, host })
  const router = new JsonServerRouter({
    root,
    host,
    port,
    open,
    publicPath
  })
  const upload = multer({ dest: path.join(publicPath, 'temp') })
  // const singleUpload = upload.single('file')
  const multiUpload = upload.array('file', 12)
  app.use(middlewares)

  // 路由
  const jsrPrefix = fs.existsSync(publicPath) ? '/jsr' : '/'

  app.get('/', function(req, res) {
    res.send(createTemplate(router.templateStore))
  })

  app.get(jsrPrefix, function(req, res) {
    res.jsonp(router.routeStore)
  })

  app.use(multiUpload, function(req, res, next) {
    const { originalUrl } = req
    if (router.fileUpload.includes(originalUrl)) {
      const { files } = req
      return res.jsonp({ code: 200, files })
    }
    next()
  })
  app.use(function(req, res, next) {
    // const { originalUrl } = req
    // split防止url上有额外query影响匹配规则
    // const urlWithoutQuery = originalUrl.split('?')[0]
    // if (router.forceGet.includes(urlWithoutQuery)) {
    // Converts POST to GET and move payload to query params
    // This way it will make JSON Server that it's GET request
    // 全部请求转换为 get 处理
    // TODO 已经定义的同 get 未定义的 走 post
    req.method = 'GET'
    req.query = req.body

    // }
    // Continue to JSON Server router
    next()
  })

  app.use(function(req, res, next) {
    queryMap.forEach(([_key, key]) => {
      req.query[_key] = req.query[key]
    })
    next()
  })

  // app.put('*', handler)
  // app.delete('*', handler)
  // app.post('*', handler)
  app.use(router.rewrite())
  app.use(router.routes())

  const server = app.listen(port, () => {
    console.info(green('❤️  visit '), blue(`http://localhost:${port}/`))
    console.info(green('❤️  visit '), blue(`http://${host}:${port}/`))
    init && open && opn(`http://localhost:${port}/`)
    console.info(
      green('❤️  查查所有mock路由以及数据源'),
      blue(`http://${host}:${port}${jsrPrefix}`)
    )
    console.info(
      green('❤️  当修改mock文件之后'),
      blue('输入 rs 刷新 mock server')
    )
    console.info(
      green('❤️  了解更多'),
      blue('https://github.com/advence-liz/json-server-router')
    )
  })
  process.on('uncaughtException', error => {
    if (error.errno === 'EADDRINUSE') {
      console.log(
        red(
          `Cannot bind to the port ${error.port}. Please specify another port number either through --port argument or through the jsr.config.js configuration file`
        )
      )
    } else {
      console.log(
        '查询文档寻求帮助:',
        blue('https://github.com/advence-liz/json-server-router')
      )
      console.log(red('Some error occurred'), error)
    }
    process.exit(1)
  })
  // http://www.html-js.com/article/The-correct-method-of-HTTP-server-nodejs-scrap-off-in-nodejs
  const sockets = []
  server.on('connection', function(socket) {
    sockets.push(socket)
    socket.once('close', function() {
      sockets.splice(sockets.indexOf(socket), 1)
    })
  })

  server.closeServer = () => {
    sockets.forEach(function(socket) {
      socket.destroy()
    })
    server.close(function() {})
  }
  return server
}
