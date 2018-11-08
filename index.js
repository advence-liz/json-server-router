const { green, blue } = require('chalk')
const debug = require('debug')('deer')
const glob = require('glob')
const jsonServer = require('json-server')
const path = require('path')
const fs = require('fs-extra')
const _ = require('lodash')
const opn = require('opn')
let $IsInit = true
/**
 * 传入opts
 * @param { Object } opts { root: 'src', port: 3000, publicPath: 'public' }
 * @description
 * root mock 文件所在目录
 * port app 端口号需要跟json-server端口号一致用来自动打开页面
 * publicPath 生成首页的路径
 */
class JsonServerRouter {
  constructor (opts = {}) {
    this.opts = {
      ...{ root: 'mock', port: 3000, publicPath: 'public' },
      ...opts
    }
    debug('context', path.resolve('root'))
    debug('opts', this.opts)
    this.routeStore = []
    this._init()
  }
  get routeSources () {
    const { root, port } = this.opts
    // 根据process.cwd()
    return glob.sync(`${root}/**/*.{js,json}`)
  }
  _init () {
    let { root, publicPath, port } = this.opts
    const templateStore = []
    this.routeSources.forEach(filePath => {
      const prefix = filePath
        .replace(/\.(js|json)$/, '')
        .replace(/\/index$/, '')
        .replace(root, '')
      /**
       * @var {Object} routes josn-server 路由对象
       */
      const routes = require(path.resolve(process.cwd(), filePath))
      this.routeStore.push(new PartRouter(routes, prefix))
      logDebugInfo(filePath, routes, prefix)
      templateStore.push(new PartTemplate(routes, prefix, filePath).render())
    })
    publicPath && fs.ensureDirSync(publicPath)
    publicPath && createTemlate(templateStore, publicPath)
    publicPath &&
      console.info(green(`❤️  visit `), blue(`http://localhost:${port}/`))
    publicPath && opn(`http://localhost:${port}/`)
  }
  // 单纯为了跟koa-router 接口一样
  routes () {
    return (req, res, next) => {
      const app = req.app
      if ($IsInit) {
        this.routeStore.forEach(partRouter => {
          partRouter.getRoutes(app)
        })

        $IsInit = false
      }
      next()
    }
  }
}
function logDebugInfo (filePath, routes, prefix) {
  debug(blue('file'), green(filePath))
  for (let key in routes) {
    debug(blue(`${prefix}/${key}`))
  }
}
function PartRouter (routes, prefix) {
  this.getRoutes = app => app.use(prefix, jsonServer.router(routes))
}
function PartTemplate (routes, prefix, filePath) {
  const arr = []
  this.render = () => {
    arr.push(
      ` <h3 class="bg-primary">${prefix} <span class="glyphicon glyphicon-file" aria-hidden="true"></span> <span class="h6" >${filePath}</span></h3>`
    )
    arr.push(`<ul>`)
    for (let key in routes) {
      arr.push(`<li> <a href="${prefix}/${key}">${prefix}/${key} </a></li>`)
    }
    arr.push(`</ul>`)
    return arr.join('\n')
  }
}
function createTemlate (templateStore, publicPath) {
  const _template = fs.readFileSync(path.join(__dirname, '_template.ejs'))
  fs.writeFileSync(
    path.join(publicPath, 'index.html'),
    _.template(_template)({ body: templateStore.join('\n') })
  )
}
module.exports = JsonServerRouter
