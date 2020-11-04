const os = require('os')
const platform = os.platform()

module.exports = () => {
  switch (platform) {
  case 'darwin':
    return 'mac'
  case 'linux':
    return 'linux'
  case 'win32':
    return 'win'
  }
}
