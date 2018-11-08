const jsonServer = require("json-server")
const server = jsonServer.create()
const middlewares = jsonServer.defaults() // { static: 'public' }
const JsonServerRouter = require("../index.js")
/**
 * @prop {string} root mock文件根目录默认为 'mock'
 * @prop {number} port 端口号跟json-server 一致
 * @prop {string} publicPath 生成默认首页的地址，跟json-server 一致默认为 'public'
 */

const router = new JsonServerRouter({
  root: "mock",
  port: 3000,
  publicPath: "public"
})

server.use(middlewares)

server.use(router.routes())

server.listen(3000, () => {
  console.log("JSON Server is running")
})
