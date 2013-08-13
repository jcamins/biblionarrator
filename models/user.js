var models,
    GraphModel = require('../lib/graphmodel');

function User(data) {
    this.initialize(data);
    return this;
}

User.model = 'user';

module.exports = GraphModel(User);


User.init = function(ref) {
    models = ref;
};
