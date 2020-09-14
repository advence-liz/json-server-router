const fs = require('fs-extra')
const path = require('path')
// > path.parse('/api/books/update')
// {
//   root: '/',
//   dir: '/api/books',
//   base: 'update',
//   ext: '',
//   name: 'update'
// }
module.exports = argv => {
  const { route } = argv
  const { dir, name } = path.parse(route)
  const target = path.join('mock', `${dir}.json`)
  if (fs.existsSync(target)) console.log(target, '已经存在')
  const template = {
    [name]: { code: 0, data: {}, msg: 'msg' }
  }
  fs.ensureFileSync(target)
  fs.writeFileSync(target, JSON.stringify(template, null, 2))
}
