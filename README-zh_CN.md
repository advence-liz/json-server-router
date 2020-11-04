# json-server-router 
[![](https://travis-ci.org/typicode/json-server.svg?branch=master)](https://travis-ci.org/typicode/json-server) [![](https://badge.fury.io/js/json-server-router.svg)](http://badge.fury.io/js/json-server-router)

[json-server-router](https://github.com/advence-liz/json-server-router)

> 简约但强大的 mock server 构建命令行工具

- [json-server-router](#json-server-router)
  - [getting-started](#getting-started)
  - [路由规则](#路由规则)
    - [路由生成规则示意](#路由生成规则示意)
    - [路由生成工具命令](#路由生成工具命令)
  - [命令参数](#命令参数)
    - [参数说明](#参数说明)
    - [`jsr.config.js` simple](#jsrconfigjs-simple)
  - [功能介绍](#功能介绍)
  - [GET](#get)
    - [Filter](#filter)
    - [Paginate](#paginate)
    - [Sort](#sort)
    - [Slice](#slice)
    - [Operators](#operators)
    - [Full-text search](#full-text-search)
    - [Relationships](#relationships)
  - [POST PUT DELETE](#post-put-delete)
  - [自定义非 GET 请求返回值](#自定义非-get-请求返回值)
    - [使非 GET 请求跟 GET 请求行为一致](#使非-get-请求跟-get-请求行为一致)
  - [文件上传](#文件上传)
  - [生成随机数据](#生成随机数据)
  - [默认集成 mockjs](#默认集成-mockjs)
  - [战斗人员可以作为`json-server`中间件引用](#战斗人员可以作为json-server中间件引用)
  - [Q&A](#qa)
  - [演示](#演示)

  - [getting-started](#getting-started)
  - [路由规则](#%e8%b7%af%e7%94%b1%e8%a7%84%e5%88%99)
    - [路由生成规则示意](#%e8%b7%af%e7%94%b1%e7%94%9f%e6%88%90%e8%a7%84%e5%88%99%e7%a4%ba%e6%84%8f)
    - [路由生成工具命令](#路由生成工具命令)
  - [命令参数](#%e5%91%bd%e4%bb%a4%e5%8f%82%e6%95%b0)
    - [参数说明](#%e5%8f%82%e6%95%b0%e8%af%b4%e6%98%8e)
    - [`jsr.config.js` simple](#jsrconfigjs-simple)
  - [功能介绍](#%e5%8a%9f%e8%83%bd%e4%bb%8b%e7%bb%8d)
  - [GET](#get)
    - [Filter](#filter)
    - [Paginate](#paginate)
    - [Sort](#sort)
    - [Slice](#slice)
    - [Operators](#operators)
    - [Full-text search](#full-text-search)
    - [Relationships](#relationships)
  - [POST PUT DELETE](#post-put-delete)
  - [自定义非 GET 请求返回值](#%e8%87%aa%e5%ae%9a%e4%b9%89%e9%9d%9eget%e8%af%b7%e6%b1%82%e8%bf%94%e5%9b%9e%e5%80%bc)
    - [使非 GET 请求跟 GET 请求行为一致](#%e4%bd%bf%e9%9d%9eget%e8%af%b7%e6%b1%82%e8%b7%9fget%e8%af%b7%e6%b1%82%e8%a1%8c%e4%b8%ba%e4%b8%80%e8%87%b4)
  - [文件上传](#%e6%96%87%e4%bb%b6%e4%b8%8a%e4%bc%a0)
  - [生成随机数据](#%e7%94%9f%e6%88%90%e9%9a%8f%e6%9c%ba%e6%95%b0%e6%8d%ae)
  - [战斗人员可以作为`json-server`中间件引用](#%e6%88%98%e6%96%97%e4%ba%ba%e5%91%98%e5%8f%af%e4%bb%a5%e4%bd%9c%e4%b8%bajson-server%e4%b8%ad%e9%97%b4%e4%bb%b6%e5%bc%95%e7%94%a8)
  - [演示](#%e6%bc%94%e7%a4%ba)

## getting-started

install json-server-router

```bash
$ npm install json-server-router -g
```

假设有文件`books.json`内容如下：

```json
// books.json
{
  "update": { "code": 200, "message": "succeed", "data": true },
  "retrieve": { "code": 200, "message": "succeed", "data": true },
  "create": { "code": 200, "message": "succeed", "data": true },
  "delete": { "code": 200, "message": "succeed", "data": true }
}
```

运行命令`$ jsr books.json`

将以`books.json`为数据源启动 mock server，
对应生成四个接口 `/books/update` `/books/retrieve` `/books/create` `/books/delete`，其中文件中每个键值成为一个接口。

运行`$ curl http://localhost:3000/books/update`

返回

```js
{
  "code": 200,
  "message": "succeed",
  "data": true
}
```

## 路由规则

如果想构建复杂的路由结构该怎么办？json-server-router 提供一个便捷的方式创建复杂路由，你只需按照一定的规则构建出对应的目录结构就好。

假设我们的目标接口为 `/aaa/bbb/ccc/update`，那么我们只需构造出如下的目录结构

> tips 当遇到名称为 `index` 的文件路径拼接的时候会忽略`index`，当遇见键值为 `index`路径拼接同样也会忽略`index`

```bash
- aaa
  - bbb
    + ccc.json   // 在ccc.json中添加 update
or

- aaa
  - bbb
    - ccc
      +index.json // 在index.json中添加update

```

运行`$ jsr aaa`就会得到目标接口；

### 路由生成规则示意

```bash
-mock
 + index.json    ------>   /xxx
 + book.json     ------>   /book/xxx
 - foo
   + index.json  ------>  /foo/xxx
   + bar.json    ------>  /foo/bar/xxx
```

### 路由生成工具命令

为了解决复杂路由需要构建复杂目录结构的问题，现提供`$ jsr route <path>` 工具命令以便按照路由规则生成对应目录结构.

```bash
$ jsr route /aaa/bbb/ccc/update
$ jsr ro /aaa/bbb/ccc/update # 简写
```

运行上述命令将自动生成目录结构`mock/aaa/bbb/ccc.json`

并且`ccc.json`自动生成如下内容

```json
{
  "update": {
    "code": 0,
    "data": {},
    "msg": "msg"
  }
}
```

## 命令参数

```bash
jsr <root> [options]

Examples:
jsr .
jsr mock
jsr books.json
jsr index.js


位置：
  root  Paths to mock files dir or file            [字符串]

选项：
  --config           Path to config file [string] [default:
                     jsr.config.js]
  --port, -p         Set port         [数字] [默认值: 3000]
  --host                 [字符串] [默认值: 本机IP]
  --watch, -w        Watch file(s)    [布尔] [默认值: true]
  --open, -o         open            [布尔] [默认值: false]
  --help, -h         显示帮助信息                    [布尔]
  --version, -v      显示版本号                      [布尔]
```

### 参数说明

- `config` 设置配置文件默认配置文件的地址是当前目录的下的`jsr.config.js`
- `watch` 监控文件变化自动重新加载

### `jsr.config.js` simple

```js
module.exports = {
  root: 'mock',
  port: 3000
}
```

## 功能介绍

## GET

`json-server-router`其底层依赖[json-server](https://github.com/typicode/json-server)所构建，所以在不出意外的情况下同时也拥有`json-server`的所有`GET`请求相关功能;

> `json-server-router`是对`json-server`的扩展所以要想更好的理解下面的内容最好要先了解[json-server](https://github.com/typicode/json-server)

### Filter

Use `.` to access deep properties

```
GET /posts?title=json-server&author=typicode
GET /posts?id=1&id=2
GET /comments?author.name=typicode
```

### Paginate

Use `_page` and optionally `_limit` to paginate returned data.

In the `Link` header you'll get `first`, `prev`, `next` and `last` links.

```
GET /posts?_page=7
GET /posts?_page=7&_limit=20
```

_10 items are returned by default_

### Sort

Add `_sort` and `_order` (ascending order by default)

```
GET /posts?_sort=views&_order=asc
GET /posts/1/comments?_sort=votes&_order=asc
```

For multiple fields, use the following format:

```
GET /posts?_sort=user,views&_order=desc,asc
```

### Slice

Add `_start` and `_end` or `_limit` (an `X-Total-Count` header is included in the response)

```
GET /posts?_start=20&_end=30
GET /posts/1/comments?_start=20&_end=30
GET /posts/1/comments?_start=20&_limit=10
```

_Works exactly as [Array.slice](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) (i.e. `_start` is inclusive and `_end` exclusive)_

### Operators

Add `_gte` or `_lte` for getting a range

```
GET /posts?views_gte=10&views_lte=20
```

Add `_ne` to exclude a value

```
GET /posts?id_ne=1
```

Add `_like` to filter (RegExp supported)

```
GET /posts?title_like=server
```

### Full-text search

Add `q`

```
GET /posts?q=internet
```

### Relationships

To include children resources, add `_embed`

```
GET /posts?_embed=comments
GET /posts/1?_embed=comments
```

To include parent resource, add `_expand`

```
GET /comments?_expand=post
GET /comments/1?_expand=post
```

To get or create nested resources (by default one level, [add custom routes](#add-custom-routes) for more)

```
GET  /posts/1/comments
POST /posts/1/comments
```

当使用`json-server` 我们可以通过构建路由`/get/users?_page=7&_limit=10`进行分页查询但是`query`的关键词必须是指定的,
在`json-server-router`中可以再`jsr.config.js`中自定义`queryMap`字段来修改关键词的名字，配置好了之后就可以通过`/get/users?page=7&len=10`进行分页查询

```js
//jsr.config.js
{
  queryMap: [
    ['_page', 'page'],
    ['_limit', 'len']
  ]
}
```

## POST PUT DELETE

关于非`GET`请求你不需要定义`mock files`，`json-server-router`对所有非`GET`请求进行统一处理不管其路由是什么一致通过 handler 函数处理

返回结果如下

```js
{
    "body": {},
    "code": 200,
    "ip": "::1",
    "message": "succeed",
    "url": "/books/"
}
```

## 自定义非 GET 请求返回值

你可以通过重写`jsr.config.js`中的 handler 函数自定义其处理结果

```js
//jsr.config.js
 {
 /**
   * 处理所有非GET请求
   * 当query fial 有值的时候认为请求设置为失败状态
   */
  handler (req, res, next) {
    const { ip, originalUrl, body } = req
    const isFail = !!req.query.fail
    res.json({
      code: isFail ? 500 : 200,
      message: isFail ? 'failed' : 'succeed',
      cookie: req.get('cookie'),
      ip,
      url: originalUrl,
      body: body
    })
  }
 }
```

### 使非 GET 请求跟 GET 请求行为一致

有的时候你可以能需要非 GET 请求得到跟 GET 请求一样的行为,此功能可以通过对 mock 数据添加魔法注释实现，
`"list[get]"`生成的路由不会包含`[get]` 当用 POST 访问 `/xxxx/list`时就会得到 mock 文件中定义的数据

```json
{
  "list[get]": [
    { "id": 0, "name": "book1" },
    { "id": 1, "name": "book2" },
    { "id": 2, "name": "book3" }
  ]
}
```

## 文件上传

jsr 支持文件上传功能只要添加 file 魔法注释即可`"upload[file]"`,目前上传文件对应的`name`固定为`file`

```json
{
  "upload[file]": { "code": 200, "message": "succeed", "data": true }
}
```

`/xxxx/upload`返回结果如下：

```json
{
  "code": 200,
  "files": [
    {
      "destination": "public/temp",
      "encoding": "7bit",
      "fieldname": "file",
      "filename": "0668151cf3f749154c6b1942abe38ad6",
      "mimetype": "application/javascript",
      "originalname": "jsr.config.js",
      "path": "public/temp/0668151cf3f749154c6b1942abe38ad6",
      "size": 494
    }
  ]
}
```

推一手[httpie](https://httpie.org/)：使用 httpie 如下命令即可完成上传文件的功能：

`$ http -f xxxx/upload file@somefile.xx`

## 生成随机数据

Using JS instead of a JSON file, you can create data programmatically.

```javascript
// index.js
module.exports = () => {
  const data = { users: [] }
  // Create 1000 users
  for (let i = 0; i < 1000; i++) {
    data.users.push({ id: i, name: `user${i}` })
  }
  return data
}
```

```bash
$ jsr index.js
```

**Tip** use modules like [Faker](https://github.com/Marak/faker.js), [Casual](https://github.com/boo1ean/casual), [Chance](https://github.com/victorquinn/chancejs) or [JSON Schema Faker](https://github.com/json-schema-faker/json-schema-faker).

## 默认集成 mockjs

为了更好的支持生成随机数据的需求现在默认集成mockjs

举例说明：可以在 mock 文件中直接使用 mockjs 语法如下文例子所示

```js
// mockjs 例子
module.exports = {
  // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
  'list|10': [
    {
      // 属性 id 是一个自增数，起始值为 1，每次增 1
      'id|+1': 1,
      // 随机中文名
      name: '@cname',
      // 随机地址
      address: '@city(true)',
      web: '@url',
      guid: '@guid',
      // 生成 200x 200 的图片
      image: "@image('200x200')",
      constellation: '@constellation',
      // 三选一
      'oneOf|1': ['one', 'two', 'three'],
      // 生成满足正则条件的字符串
      regexp1: /[a-z][A-Z][0-9]/,
      regexp2: /\w\W\s\S\d\D/,
      regexp3: /\d{5,10}/
    }
  ]
}
```

## 战斗人员可以作为`json-server`中间件引用

可以参考`cli/server.js`

```js
const jsonServer = require('json-server')
const server = jsonServer.create()
const middlewares = jsonServer.defaults() // { static: 'public' }
const JsonServerRouter = require('json-server-router')

/**
 * @prop {string} root mock文件根目录默认为 'mock'
 * @prop {number} port 端口号跟json-server 一致 默认为 3000
 * @prop {string} publicPath 生成默认首页的地址，跟json-server 配置一致 默认'public',如果修改路径的话那么json-server 对应的配置也要改
 * @prop {bool} open 是否用浏览器打开 默认 true
 */

const router = new JsonServerRouter({
  root: 'mock',
  port: 3000,
  publicPath: 'public'
})

server.use(middlewares)

server.use(router.routes())
server.use(router.rewrite())

server.listen(3000, () => {
  console.log('JSON Server is running')
})
```

## Q&A

如有疑问可直接加微信面基

![](doc/id.jpeg)

## 演示

![](doc/jsr.gif)
