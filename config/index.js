var nconf = require('nconf'),
    path = require('path'),
    configDev = path.join(__dirname, 'config-dev.json'),
    configProd = path.join(__dirname, 'config-prod.json')

nconf.env()

if (nconf.get('NODE_ENV') == "prod") {
  nconf.file(configProd)
} else {
  nconf.file(configDev)
}

module.exports = nconf

// Refactor commented for now
// var configFile = 'config-' + nconf.get('NODE_ENV') + '.json'
//
// nconf.file(path.join(__dirname, configFile))
