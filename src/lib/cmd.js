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
    if (typeof argv.config !== 'undefined') {
        /*jshint unused:true */
        var environment = require('./environment').load(argv.c);
        /*jshint unused:false */
    }
    return argv;
};
