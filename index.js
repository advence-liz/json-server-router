const { green, blue, red } = require('chalk')
const debug = require('debug')('jsr:router')
const glob = require('glob')
const jsonServer = require('json-server')
const path = require('path')
const fs = require('fs-extra')
const express = require('express')
const rewrite = require('express-urlrewrite')
const os = require('./lib/os')
const { mock } = require('mockjs')
const { parse } = require('comment-json')
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
  constructor(opts = {}) {
    this.opts = opts
    this.opts.root = path.resolve(this.opts.root)
    debug(this.opts)
    this.routeStore = []
    // 用于常规路由
    this.fileUpload = []
    this.templateStore = []
    // 用于自定义路由
    this.routeMap = new Map()
    this.$IsInit = true
    this.isFile = false
    this._init()
  }
  get routeSources() {
    const { root } = this.opts
    let stat = null
    try {
      stat = fs.statSync(path.resolve(root))
      this.isFile = stat.isFile()
    } catch (error) {
      console.info(red('no such file or directory'), red(path.resolve(root)))
      process.exit(0)
    }

    return this.isFile ? [root] : glob.sync(`${root}/**/*.{js,json,jsonc}`)
  }
  _init() {
    let { root, publicPath, port, open, host } = this.opts
    // 由于未能指定正确的 mock 目录，比如 jsr 扫描文件到 node_modules中，由于文件过多会导致卡死
    if (this.routeSources.length > 300) {
      console.log(
        green('当前mcok根目录为'),
        green(root),
        red('文件数量过多,请选择正确的，mock根目录!')
      )
      console.log(blue('更多用法: $ jsr -h'))
      process.exit(0)
    }
    // win \json-server-router\example\mock 替换成 /json-server-router/example/mock 才成
    if (os() === 'win') root = root.replace(/\\/g, '/')

    this.routeSources.forEach(filePath => {
      // console.log(filePath)
      const prefix = filePath
        .replace(/\.(js|json|jsonc)$/, '')
        .replace(/\/index$/, '')
        .replace(this.isFile ? path.parse(root).dir : root, '')

      /**
       * @var {Object} routes josn-server 路由对象
       * @description
       *  const routes = require(path.resolve(filePath))
       *  上面的写法会走缓存，如果文件以及修改了变拿不到新值
       */
      // path.resolve 会自动将window 下分割符\，转为 Unix 分隔符/,用以解决 window 下缓存未清除问题
      delete require.cache[path.resolve(filePath)]
      let routes = null
      try {
        if (path.parse(filePath).ext === '.jsonc') {
          routes = mock(parse(fs.readFileSync(filePath).toString()))
        } else {
          routes = mock(require(filePath))
        }
      } catch (error) {
        console.log(red(`文件解析错误: ${filePath}`))
        console.log(error)
        return
      }
      /**
       * 检测文件内容是否满足 json-server-router 生成路由要求
       */
      for (let routeKey of Object.keys(routes)) {
        // 如果检测到 key 对应的 val 不是对象，则认为整个文件不合规，停止处理该文件
        if (typeof routes[routeKey] !== 'object') {
          console.log(
            red(filePath),
            green(
              '不满足 json-server-router 生成路由要求, 文件中 key 对应的 val 必须为对象'
            )
          )
          return
        }
      }
      /**
       * 遍历对象键值解析出路径中配置目前就支持route file
       */
      Object.keys(routes).forEach(key => {
        let { name: parsedKey, file = false, route = '' } = parseName(key)
        // 自定义路由
        if (route) {
          console.log(parsedKey, route)
          const newRoute = path.join(prefix, route)
          if (this.routeMap.has(newRoute)) {
            this.routeMap.set(newRoute, {
              ...this.routeMap.get(newRoute),
              ...{ [parsedKey]: routes[key] }
            })
          } else {
            this.routeMap.set(newRoute, { [parsedKey]: routes[key] })
          }
          this.templateStore.push(
            new PartTemplate(
              { [parsedKey]: routes[key] },
              newRoute,
              filePath
            ).render()
          )
          delete routes[key]
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
    this.routeMap.forEach((val, key) => {
      this.routeStore.push(new PartRouter(val, key))
    })
    console.log(this.routeMap)
  }
  // 注册各个子路由
  routes() {
    return (req, res, next) => {
      const app = req.app
      if (this.$IsInit) {
        const compareRegex = /\//g

        this.routeStore.sort(function(x, y) {
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
  rewrite() {
    let { root, routes } = this.opts
    const router = express.Router()
    glob.sync(`${root}/**/index.{js,json,jsonc}`).forEach(filePath => {
      let prefix = path.parse(filePath.replace(root, '')).dir
      // 匹配 /books 或者 /books?xx
      let prefixReg = new RegExp(`(${prefix}\\?[^?/]*)|(^${prefix}$)`)
      router.use(rewrite(prefixReg, `${prefix}/index`))
    })

    if (routes) {
      Object.keys(routes).forEach(key => {
        router.use(rewrite(key, routes[key]))
      })
    }

    return router
  }
}

/**
 *
 * @param {object} routes  当前文件输出JavaScript object
 * @param {string} prefix  路由前缀
 */
function PartRouter(routes, prefix) {
  this.prefix = prefix
  this.routes = routes
  this.getRoutes = app => app.use(`${prefix}`, jsonServer.router(routes))
}
function PartTemplate(routes, prefix, filePath) {
  const arr = []
  this.render = () => {
    arr.push(
      ` <h3 class="bg-primary"><span class="glyphicon glyphicon-file" aria-hidden="true"></span> <span class="h6" >${filePath}</span></h3>`
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
