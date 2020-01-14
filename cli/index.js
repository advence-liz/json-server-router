#!/usr/bin/env node
const yargs = require('yargs')
const ip = require('ip')
const debug = require('debug')('jsr:cli')
const { blue, red, green, bgRed } = require('chalk')
const pkg = require('../package.json')
const updateNotifier = require('update-notifier')
updateNotifier({ pkg }).notify()
const run = require('./run')
const config = require('./config')

const argv = yargs
  .config(config)
  .config(
    'config',
    'Path to config file [string] [default: jsr.config.js]',
    function (configPath) {
      console.log(configPath)
      return require(configPath)
    }
  )
  .usage('$0 [options]')
  .options({
    port: {
      alias: 'p',
      type: 'number',
      description: 'Set port',
      default: 3000
    },
    host: {
      type: 'string',
      default: ip.address()
    },
    static: {
      type: 'string',
      description: 'Set static files directory(same as json-server)',
      default: 'public'
    },
    watch: {
      alias: 'w',
      type: 'boolean',
      description: 'Watch file(s)',
      default: true
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
  .command(
    '$0 [root]',
    'welcome',
    yargs => {
      yargs.positional('root', {
        type: 'string',
        default: '.',
        describe: 'Paths to mock files dir or file '
      })
    },
    function (argv) {
      // export DEBUG=jsr:*
      debug(argv)
      run(argv)
    }
  )
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
