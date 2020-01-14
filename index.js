const { green, blue, red } = require('chalk')
const debug = require('debug')('jsr:router')
const glob = require('glob')
const jsonServer = require('json-server')
const path = require('path')
const fs = require('fs-extra')
const express = require('express')
const rewrite = require('express-urlrewrite')
const opn = require('opn')
const parseName = require('./lib/parseName')

/**
 * 传入opts
 * @param { Object } opts { root: 'src', port: 3000, publicPath: 'public',open:true }
 * @description
 * root mock 文件所在目录 默认值 'mock'
 * port app 端口号需要跟json-server端口号一致 默认值 3000
 * publicPath 生成首页的路径 默认 'public'
 * open 默认打开浏览器 默认true
 */
class JsonServerRouter {
  constructor (opts = {}) {
    this.opts = opts
    this.opts.root = path.resolve(this.opts.root)
    debug(this.opts)
    this.routeStore = []
    this.forceGet = []
    this.fileUpload = []
    this.templateStore = []
    this.$IsInit = true
    this.isFile = false
    this._init()
  }
  get routeSources () {
    const { root } = this.opts
    let stat = null
    try {
      stat = fs.statSync(path.resolve(root))
      this.isFile = stat.isFile()
    } catch (error) {
      console.info(red('no such file or directory'), red(path.resolve(root)))
      process.exit(0)
    }

    return this.isFile ? [root] : glob.sync(`${root}/**/*.{js,json}`)
  }
  _init () {
    let { root, publicPath, port, open, host } = this.opts

    this.routeSources.forEach(filePath => {
      const prefix = filePath
        .replace(/\.(js|json)$/, '')
        .replace(/\/index$/, '')
        .replace(this.isFile ? path.parse(root).dir : root, '')

      /**
       * @var {Object} routes josn-server 路由对象
       * @description
       *  const routes = require(path.resolve(filePath))
       *  上面的写法会走缓存，如果文件以及修改了变拿不到新值
       */

      delete require.cache[filePath]
      const routes = require(filePath)
      /**
       * 遍历对象键值解析出路径中配置目前就支持get file
       */
      Object.keys(routes).forEach(key => {
        let { name: parsedKey, get = false, file = false } = parseName(key)
        if (get) {
          routes[parsedKey] = routes[key]
          delete routes[key]
          this.forceGet.push(path.join(prefix, parsedKey))
          debug('forceGet', this.forceGet)
        }
        if (file) {
          routes[parsedKey] = routes[key]
          delete routes[key]
          this.fileUpload.push(path.join(prefix, parsedKey))
          debug('fileUpload', this.fileUpload)
        }
      })
      this.routeStore.push(new PartRouter(routes, prefix))
      this.templateStore.push(
        new PartTemplate(routes, prefix, filePath).render()
      )
    })

    open && opn(`http://localhost:${port}/`)
  }
  // 注册各个子路由
  routes () {
    return (req, res, next) => {
      const app = req.app
      if (this.$IsInit) {
        const compareRegex = /\//g

        this.routeStore.sort(function (x, y) {
          const xlen =
            (x.prefix.match(compareRegex) &&
              x.prefix.match(compareRegex).length) ||
            0
          const ylen =
            (y.prefix.match(compareRegex) &&
              y.prefix.match(compareRegex).length) ||
            0
          return xlen - ylen
        })

        this.routeStore.reverse().forEach(partRouter => {
          partRouter.getRoutes(app)
        })
        // app.use(this.rewrite()) 没起效在外面调用起效了why?
        this.$IsInit = false
      }
      next()
    }
  }
  // 对所有的xxx/index.{js,json}添加处理让路由xxx/ rewrite 到 xxx/index
  rewrite () {
    let { root } = this.opts
    const router = express.Router()
    glob.sync(`${root}/**/index.{js,json}`).forEach(filePath => {
      let prefix = path.parse(filePath.replace(root, '')).dir
      // 匹配 /books 或者 /books?xx
      let prefixReg = new RegExp(`(${prefix}\\?[^?/]*)|(^${prefix}$)`)
      router.use(rewrite(prefixReg, `${prefix}/index`))
    })

    return router
  }
}
function logDebugInfo (filePath, routes, prefix) {
  debug(blue('file'), green(filePath))
  for (let key in routes) {
    debug(blue(`${prefix}/${key}`))
  }
}
/**
 *
 * @param {object} routes  当前文件输出JavaScript object
 * @param {string} prefix  路由前缀
 */
function PartRouter (routes, prefix) {
  this.prefix = prefix
  this.routes = routes
  this.getRoutes = app => app.use(`${prefix}`, jsonServer.router(routes))
}
function PartTemplate (routes, prefix, filePath) {
  const arr = []
  this.render = () => {
    arr.push(
      ` <h3 class="bg-primary">${prefix} <span class="glyphicon glyphicon-file" aria-hidden="true"></span> <span class="h6" >${filePath}</span></h3>`
    )
    arr.push('<ul>')
    for (let key in routes) {
      let uri = `${prefix}/${key}`.replace(/\/index$/, '')
      arr.push(`<li> <a href="${uri}">${uri} </a></li>`)
    }
    arr.push('</ul>')
    return arr.join('\n')
  }
}

module.exports = JsonServerRouter
