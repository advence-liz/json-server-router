const { green, blue } = require('chalk')
const debug = require('debug')('json-server-router')
const glob = require('glob')
const jsonServer = require('json-server')
const path = require('path')
const fs = require('fs-extra')
const _ = require('lodash')
const express = require('express')
const rewrite = require('express-urlrewrite')
const opn = require('opn')
let $IsInit = true
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
    this.opts = {
      ...{ root: 'mock', port: 3000, publicPath: 'public', open: true },
      ...opts
    }

    debug('opts', this.opts)
    this.routeStore = []
    this._init()
  }
  get routeSources () {
    const { root } = this.opts
    // 根据process.cwd()
    return glob.sync(`${root}/**/*.{js,json}`)
  }
  _init () {
    let { root, publicPath, port, open, host } = this.opts
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
    if (publicPath) {
      fs.ensureDirSync(publicPath)
      createTemlate(templateStore, publicPath)
      console.info(green(`❤️  visit `), blue(`http://localhost:${port}/`))
      console.info(green(`❤️  visit `), blue(`http://${host}:${port}/`))
      open && opn(`http://localhost:${port}/`)
    }
  }
  // 单纯为了跟koa-router 接口一样
  routes () {
    return (req, res, next) => {
      const app = req.app
      if ($IsInit) {
        const compareRegex = /\//g
        this.routeStore.sort(function (x, y) {
          return (
            x.prefix.match(compareRegex).length -
            y.prefix.match(compareRegex).length
          )
        })

        this.routeStore.reverse().forEach(partRouter => {
          partRouter.getRoutes(app)
        })
        // app.use(this.rewrite()) 没起效在外面调用起效了why?
        $IsInit = false
      }
      next()
    }
  }

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
  console.info(blue('file'), green(filePath))
  for (let key in routes) {
    console.info(blue(`${prefix}/${key}`))
  }
}
/**
 *
 * @param {object} routes  当前文件输出JavaScript object
 * @param {string} prefix  路由前缀
 */
function PartRouter (routes, prefix) {
  this.prefix = prefix
  this.getRoutes = app => app.use(`${prefix}`, jsonServer.router(routes))
}
function PartTemplate (routes, prefix, filePath) {
  const arr = []
  this.render = () => {
    arr.push(
      ` <h3 class="bg-primary">${prefix} <span class="glyphicon glyphicon-file" aria-hidden="true"></span> <span class="h6" >${filePath}</span></h3>`
    )
    arr.push(`<ul>`)
    for (let key in routes) {
      let uri = `${prefix}/${key}`.replace(/\/index$/, '')
      arr.push(`<li> <a href="${uri}">${uri} </a></li>`)
    }
    arr.push(`</ul>`)
    return arr.join('\n')
  }
}
function createTemlate (templateStore, publicPath) {
  const _template = fs.readFileSync(path.join(__dirname, '_template.html'))
  fs.writeFileSync(
    path.join(publicPath, 'index.html'),
    _.template(_template)({ body: templateStore.join('\n') })
  )
}
module.exports = JsonServerRouter
