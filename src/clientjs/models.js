environment = window.environment;
formatters = window.formatters;

var extend = require('extend');

function Record(data) {
    this.model = 'record';

    this.render = function() {
        if (typeof this.data === 'undefined' || this.data === null || this.data === '') {
            return '<article><header></header><section></section></article>';
        }
        if (typeof this.data === 'string') {
            this.data = JSON.parse(this.data);
        }
        if (typeof formatters[this.format] === 'undefined') {
            return '';
        } else if (typeof formatters[this.format].render === 'function') {
            return formatters[this.format].render(this.data);
        } else {
            return environment.renderer.render(this.template || this.format, { record: this.data });
        }
    };

    /**
     * Generate a snippet record
     * @returns {Record} Snippet record
     */
    this.snippet = function () {
        if (typeof this.data === 'string') {
            this.data = JSON.parse(this.data);
        }
        return new Record({
            id: this.id,
            data: formatters[this.format].snippet(this.data)
        });
    };

    extend(this, data);

    return this;
}

Record.render = function (rec) {
    var rec = new models.Record(rec);
    return rec.render();
};

window.models = { Record: Record };
