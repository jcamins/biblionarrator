var offloader = require('./graphoffloader');

module.exports = function (all) {
    offloader().send({'facet': all});
    return;
}
