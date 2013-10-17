var optimist = require('optimist');

module.exports = function (usage, options) {
    usage = usage || '';
    if (usage.indexOf("\n") === -1) {
        optimist = optimist.usage(usage + "\nUsage: $0");
    }
    optimist = optimist.options({
        help: {
            alias: 'h',
            boolean: true,
            describe: 'Display this help'
        },
        config: {
            alias: 'c',
            string: true,
            describe: 'Configuration file to use'
        },
        heap: {
            describe: 'Java heap size'
        }
    });
    if (options) {
        optimist = optimist.options(options);
    }

    var argv = optimist.argv;

    if (argv.help) {
        optimist.showHelp();
        process.exit();
    }
    /*jshint unused:true */
    if (typeof argv.config !== 'undefined') {
        var environment = require('./environment').load(argv.c);
    } else {
        var environment = require('./environment');
    }
    /*jshint unused:false */
    if (argv.heap) {
        process.env['GREMLIN_JAVA_OPTIONS'] = process.env['GREMLIN_JAVA_OPTIONS'] + ' -Xmx' + argv.heap;
    }
    return argv;
};
