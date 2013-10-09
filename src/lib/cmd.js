var argv = require('optimist')
    .usage('Usage: $0 -p [port] -c [config]')
    .argv;

if (typeof argv.c !== 'undefined') {
    /*jshint unused:true */
    var environment = require('./environment').load(argv.c);
    /*jshint unused:false */
}
var options = {
    config: argv.c || 'defaults',
    port:  argv.p,
    argv: argv._
};

module.exports = options;
