#!/usr/bin/env node
const yargs = require('yargs')
const ip = require('ip')
const fs = require('fs')
const { blue, red, green, bgRed } = require('chalk')
const run = require('./run')
const pkg = require('../package.json')
const updateNotifier = require('update-notifier')
updateNotifier({ pkg }).notify()
const host = ip.address()
console.log(host)
const argv = yargs
  .config({ host: ip.address() })
  .config('config', function (configPath) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  })
  .usage('$0 [options]')
  .options({
    port: {
      alias: 'p',
      type: 'number',
      description: 'Set port',
      default: 3000
    },
    // host: {
    //   alias: 'h'
    // },

    root: {
      alias: 'r',
      type: 'string',
      description: 'Paths to mock dir(rel'
    },
    watch: {
      alias: 'w',
      type: 'boolean',
      description: 'Watch file(s) TODO'
    },
    open: {
      alias: 'o',
      type: 'boolean',
      description: 'open',
      default: false
    },
    middlewares: {
      alias: 'm',
      type: 'array',
      description: 'Paths to middleware files TODO'
    }
  })
  .group('root', 'Options Required:')
  .demandOption('root')
  .example('$0 --root mock')
  .example('$0 --root mock --port 3000')
  .help('help')
  .alias('help', 'h')
  .version(pkg.version)
  .alias('version', 'v')
  .fail(function (msg, err, yargs) {
    if (err) throw err // preserve stack
    console.info(bgRed('You broke it!'))
    console.info(red(msg))
    console.error(green('You should be doing'), yargs.help())
    process.exit(1)
  }).argv

let server = run(argv)

process.stdin.on('error', () => {
  console.log(`  Error, can't read from stdin`)
  console.log(`  Creating a snapshot from the CLI won't be possible`)
})
process.stdin.setEncoding('utf8')

process.stdin.on('data', chunk => {
  if (chunk.trim().toLowerCase() === 'rs') {
    console.log(blue(`has changed, reloading...`))
    server.closeServer()
    server = run(argv)
  }
})
