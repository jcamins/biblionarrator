var worker = require('child_process').fork(__dirname + '/graphworker');

module.exports = function () {
    return worker;
};

process.on('exit', function () {
    worker.kill();
});
