const createServer = require('./server')
const chokidar = require('chokidar')
const path = require('path')
const { blue, green } = require('chalk')

module.exports = argv => {
  let server = createServer(argv)
  process.stdin.on('error', () => {
    console.log('  Error, can\'t read from stdin')
  })
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', chunk => {
    if (chunk.trim().toLowerCase() === 'rs') {
      console.log('')
      console.log(green(' reloading...'))
      console.log('')
      server.closeServer()
      server = createServer(argv)
    }
  })
  const { root, watch } = argv
  if (watch) {
    chokidar
      .watch(path.resolve(root), {
        ignored: /(^|[/\\])\../,
        ignoreInitial: true
      })
      .on('all', (event, path) => {
        console.log(blue(`   ${event}       ${path} has changed reloading...`))
        console.log(green('          please waiting...'))
        console.log('')
        console.count('createServer')
        server.closeServer()
        server = createServer(argv)
      })
  }
}
