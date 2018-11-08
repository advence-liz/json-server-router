# json-server-router

json-server-router 是 json-server 中间件,其作用是提供一个简明的方式构建出各种路由接口

## json-server

在使用 json-server 时你写了如下文件(router.json) 也就代表你得到了四个 mock 接口
`/update` ,`/retrieve`, `/create` ,`/delete`
但是实际的需求中接口路由肯定不能这么简单你需要的可能是 `/aaa/bbb/ccc/update`这样的形式
所以 josn-server-router middleware 的目的就是提供一种简单的方式构建任意路由

```json
// router.json
{
  "update": { "code": 200, "message": "succeed", "data": true },
  "retrieve": { "code": 200, "message": "succeed", "data": true },
  "create": { "code": 200, "message": "succeed", "data": true },
  "delete": { "code": 200, "message": "succeed", "data": true }
}
```

## json-server-router 使用方式

json-server-router 的实现理念是根据目录结构，构建出想要的接口形式
假设我们的目标接口为 `/aaa/bbb/ccc/update`
那么我们只需构件出目录结构

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

简单的路由生成示意大概下面这个样子,`src`为mock文件的根目录

```bash
src/books/index.json
-src
 + index.json    ------>   /xxx
 + book.json     ------>   /book/xxx
 - foo
   + index.json  ------>  /foo/xxx
   + bar.json    ------>  /foo/bar/xxx
```
