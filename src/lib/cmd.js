var argv = require('optimist')
    .usage('Usage: $0 -p [port] -c [config]')
    .argv;

if (typeof argv.c !== 'undefined') {
    var environment = require('../src/lib/environment').load(argv.c);
}
var options = {
    config: argv.c || 'defaults',
    port:  argv.p,
    argv: argv._
}

module.exports = options;
