var nconf = require('nconf'),
    path = require('path')
    // configDev = path.join(__dirname, 'config-dev.json'),
    // configProd = path.join(__dirname, 'config-prod.json')

nconf.env()

var configFile = 'config-' + nconf.get('NODE_ENV') + '.json'
nconf.file(path.join(__dirname, configFile))

module.exports = nconf
