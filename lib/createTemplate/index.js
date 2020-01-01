const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')

function createTemlate (templateStore) {
  const _template = fs.readFileSync(path.join(__dirname, '_template.html'))
  return _.template(_template)({ body: templateStore.join('\n') })
}
module.exports = createTemlate
