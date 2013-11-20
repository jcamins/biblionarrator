var extend = require('extend');
var Record = require('../models/record');

function GraphModel() {
}

GraphModel.extend = function (Model) {
    Model.prototype.initialize = function (data) {
        extend(this, data);
        if (typeof this.id === 'undefined') {
            this.id = this._id;
        }
        if (typeof this.id === 'string') {
            this.id = this.id.replace('#', '');
        }
    }
};

Record.init({ }, {
    environment: window.environment,
    GraphModel: GraphModel,
    formatters: window.formatters
});

window.models = { Record: Record };
