# json-server-router

[json-server-router](https://github.com/advence-liz/json-server-router)

> Simple and Robust Mock Server For Creating Router Command Tools

- [json-server-router](#json-server-router)

  - [getting-started](#getting-started)
  - [Router Rules](#%e8%b7%af%e7%94%b1%e8%a7%84%e5%88%99)
    - [Router generate rules show](#%e8%b7%af%e7%94%b1%e7%94%9f%e6%88%90%e8%a7%84%e5%88%99%e7%a4%ba%e6%84%8f)
    - [Route generation tool commands](#Route generation tool commands)
  - [Command Parameter](#%e5%91%bd%e4%bb%a4%e5%8f%82%e6%95%b0)
    - [Parameter intruduciton](#%e5%8f%82%e6%95%b0%e8%af%b4%e6%98%8e)
    - [`jsr.config.js` simple](#jsrconfigjs-simple)
  - [Function intruduction](#%e5%8a%9f%e8%83%bd%e4%bb%8b%e7%bb%8d)
  - [GET](#get)
    - [Filter](#filter)
    - [Paginate](#paginate)
    - [Sort](#sort)
    - [Slice](#slice)
    - [Operators](#operators)
    - [Full-text search](#full-text-search)
    - [Relationships](#relationships)
  - [POST PUT DELETE](#post-put-delete)
  - [Self-defined none GET request return value](#%e8%87%aa%e5%ae%9a%e4%b9%89%e9%9d%9eget%e8%af%b7%e6%b1%82%e8%bf%94%e5%9b%9e%e5%80%bc)
    - [make none GET request same as GET request](#%e4%bd%bf%e9%9d%9eget%e8%af%b7%e6%b1%82%e8%b7%9fget%e8%af%b7%e6%b1%82%e8%a1%8c%e4%b8%ba%e4%b8%80%e8%87%b4)
  - [File Upload](#%e6%96%87%e4%bb%b6%e4%b8%8a%e4%bc%a0)
  - [Generate Random Data](#%e7%94%9f%e6%88%90%e9%9a%8f%e6%9c%ba%e6%95%b0%e6%8d%ae)
  - [The combatant can be referenced as' JSON-Server 'middleware](#%e6%88%98%e6%96%97%e4%ba%ba%e5%91%98%e5%8f%af%e4%bb%a5%e4%bd%9c%e4%b8%bajson-server%e4%b8%ad%e9%97%b4%e4%bb%b6%e5%bc%95%e7%94%a8)
  - [Show](#%e6%bc%94%e7%a4%ba)

## getting-started

install json-server-router

```bash
$ npm install json-server-router -g
```

Assume we have file named `books.json`, content shows below：

```json
// books.json
{
  "update": { "code": 200, "message": "succeed", "data": true },
  "retrieve": { "code": 200, "message": "succeed", "data": true },
  "create": { "code": 200, "message": "succeed", "data": true },
  "delete": { "code": 200, "message": "succeed", "data": true }
}
```

Run command`$ jsr books.json`

Start up mock server using `books.json` as data resource，
Generate four interface `/books/update` `/books/retrieve` `/books/create` `/books/delete`，each key value becomes an interface.

Run `$ curl http://localhost:3000/books/update`

Return

```js
{
  "code": 200,
  "message": "succeed",
  "data": true
}
```

## Router Rules

What if you want to build a complex routing structure? Json-server-router provides a convenient way to create complex routes, 
you just need to build the corresponding directory structure according to certain rules.

Assuming that our target interface is'/aaa/bbb/ccc/update ', we only need to construct the following directory structure
> tips ignores' index 'when it encounters a file path splicing with the name' index ', it will be same as meeting key value ' index '.

```bash
- aaa
  - bbb
    + ccc.json   // add update in ccc.json 
or

- aaa
  - bbb
    - ccc
      +index.json //  add update in index.json 

```

Run `$ jsr aaa`, then you will get target interface；

### Routing generates rule diagrams

```bash
-mock
 + index.json    ------>   /xxx
 + book.json     ------>   /book/xxx
 - foo
   + index.json  ------>  /foo/xxx
   + bar.json    ------>  /foo/bar/xxx
```

### Routing generates command tool

In order to solve  complex directory structures, the '$JSR route <path>' tool command is provided to 
generate the corresponding directory structures according to the routing rules.

```bash
$ jsr route /aaa/bbb/ccc/update
$ jsr ro /aaa/bbb/ccc/update # simple type
```

Run the command will automatically generate directory structures`mock/aaa/bbb/ccc.json`

And `ccc.json`will auto-generate following content:

```json
{
  "update": {
    "code": 0,
    "data": {},
    "msg": "msg"
  }
}
```

## Command Parameter

```bash
jsr <root> [options]

Examples:
jsr .
jsr mock
jsr books.json
jsr index.js


Location：
  root  Paths to mock files dir or file            [String]

Choose：
  --config           Path to config file [string] [default:
                     jsr.config.js]
  --port, -p         Set port         [number] [default: 3000]
  --host                 [String] [default: client IP]
  --watch, -w        Watch file(s)    [Boolean] [default: true]
  --open, -o         open            [Boolean] [default: false]
  --help, -h         show help information         [Boolean]
  --version, -v      show version                  [Boolean]
```

### Parameter intruduction

- `config` Setting default configuration file is in current location named `jsr.config.js`
- `watch` Monitor file changes automatically reload

### `jsr.config.js` simple

```js
module.exports = {
  root: 'mock',
  port: 3000
}
```

## Function Intruduction

## GET

`json-server-router`Its underlying dependency [json-server](https://github.com/typicode/json-server) created，
Therefore, it also has all 'GET' request-related functions of 'JSON-Server' without any accidents.

> `json-server-router`is the extension for`json-server`
So if you want to understand better you need to understand this json-server](https://github.com/typicode/json-server)

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
When using 'JSON-Server' we can build the route '/get/users? _page=7&_limit=10 'to do paging but the keywords of' query 'must be specified,
In `json-server-router`,you could self-defined `queryMap` to change the name of the keyword in `jsr.config.js`，
Once configured, you can use '/get/users? Page =7&len=10 'for paging query.

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

For non-' GET 'requests you do not need to define' mock Files', 'JSON-Server-Router' handles all non-' GET 'requests uniformly
regardless of their route through the handler function.

Return result 

```js
{
    "body": {},
    "code": 200,
    "ip": "::1",
    "message": "succeed",
    "url": "/books/"
}
```

## Self-defined none GET request return value

You can customize the result of the handler function in 'jsr.config.js' by overwriting it

```js
//jsr.config.js
 {
 /**
   * Deal with all none Get request
   * Return fail when the query fial has value
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

### make none GET request same as GET request

Sometimes you can require a non-GET request to GET the same behavior as a GET request. This can be done by adding magic comments to the mock data.
The route generated by '"list[get]"' does not contain the data defined in the mock file when '[get]' is accessed by POST '/ XXXX /list'

```json
{
  "list[get]": [
    { "id": 0, "name": "book1" },
    { "id": 1, "name": "book2" },
    { "id": 2, "name": "book3" }
  ]
}
```

## File Upload

jsr ' 'Upload [File]' 'Can be created simply by adding a magic comment of' file '. At present, the 'name' corresponding to the uploaded file is fixed as' file '

```json
{
  "upload[file]": { "code": 200, "message": "succeed", "data": true }
}
```

`/xxxx/upload`Return result ：

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

[httpie](https://httpie.org/)：Using httpie command can finish file upload function：

`$ http -f xxxx/upload file@somefile.xx`

## Generate Random data

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

## Default integrate with mockjs

To better support the need to generate random data, MockJS is now integrated by default

For example: You can use the MockJS syntax directly in a mock file,following example:

```js
// mockjs example
module.exports = {
  //  attribute list value is an array from 1 to 10 elements
  'list|10': [
    {
      //The attribute ID is a self-incrementing number that starts at 1 and increments by 1 each time
      'id|+1': 1,
      // random chines name
      name: '@cname',
      // random address
      address: '@city(true)',
      web: '@url',
      guid: '@guid',
      // generate 200x 200 image
      image: "@image('200x200')",
      constellation: '@constellation',
      // choose one from three options
      'oneOf|1': ['one', 'two', 'three'],
      // Generate string meet the regex condition
      regexp1: /[a-z][A-Z][0-9]/,
      regexp2: /\w\W\s\S\d\D/,
      regexp3: /\d{5,10}/
    }
  ]
}
```

## The combatant can be referenced as' JSON-Server 'middleware

You can refere `cli/server.js`

```js
const jsonServer = require('json-server')
const server = jsonServer.create()
const middlewares = jsonServer.defaults() // { static: 'public' }
const JsonServerRouter = require('json-server-router')

/**
 * @prop {string} root the root directory for mock file is 'mock'
 * @prop {number} port  teh same as json-server is 3000
 * @prop {string} publicPath generate default main page address，has the same setting as json-server ,the default is 'public',
 *                            if you change the path then the configuration of the JSON-Server should also be changed
 * @prop {bool} open whether open using a browser default true
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

If you have questions, feel free to add my wechat

![](doc/id.jpeg)

## Demo

![](doc/jsr.gif)
