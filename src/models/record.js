"use strict";
var models,
    environment,
    GraphModel,
    formatters,
    extend = require('extend');

/**
 * Represents a single record.
 * @constructor
 * @param {object} data - object to reify as a Record model
 *
 */
function Record(data) {
    var self = this;
    this.model = 'record';

    this.render = function() {
        if (typeof this.data === 'undefined' || this.data === null || this.data === '' || typeof formatters[this.format] === 'undefined') {
            return '<article><header></header><section></section></article>';
        }
        if (typeof this.data === 'string') {
            this.data = JSON.parse(this.data);
        }
        Object.defineProperties(this.data, {
            "id": {
                "get": function () { return self._id; }
            }
        });
        if (typeof formatters[this.format].render === 'function') {
            return formatters[this.format].render(this.data, this.recordclass);

        } else if (this.template && environment.renderer.registered(this.template)) {
            return environment.renderer.render(this.template, { record: this.data });
        } else if (environment.renderer.registered(this.format + '_' + this.recordclass)) {
            return environment.renderer.render(this.format + '_' + this.recordclass, { record: this.data });
        } else if (environment.renderer.registered(this.format)) {
            return environment.renderer.render(this.format, { record: this.data });
        } else {
            return '<article><header></header><section></section></article>';
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
            data: formatters[this.format].snippet(this.data, this.recordclass),
        });
    };

    this.addMedia = function (hash, description, type, filename) {
        this.media[hash] = { description: description, type: type, filename: filename };
    };

    this.delMedia = function (filename) {
        delete this.media[filename];
    };

    this.getLinks = function () {
        if (typeof formatters[this.format] === 'undefined') {
            return [];
        } else {
            return formatters[this.format].links(this.data, this.recordclass);
        }
    };

    this.mergeIndexes = function () {
        if (typeof formatters[this.format] !== 'undefined') {
            extend(this, formatters[this.format].indexes(this.data, this.recordclass));
        }
    };

    this.initialize(data);

    if (typeof this.data === 'string') {
        this.data = JSON.parse(this.data);
    }

    this.media = this.media || { };
    if (typeof this.media === 'string') {
        this.media = JSON.parse(this.media);
    }
    for (var media in this.media) {
        Object.defineProperties(this.media[media], {
            "recordid": { "get": function () { return self.id; } }
        });
    }

    if (!this.no_index) this.mergeIndexes();

    if (typeof this.no_index !== 'undefined') {
        delete this.no_index;
    }

    return this;
}

Record.render = function (rec) {
    var rec = new Record(rec);
    return rec.render();
};

Record.model = 'record';

module.exports = Record;

Record.init = function(ref, dependencies) {
    models = ref;
    environment = dependencies.environmnent;
    GraphModel = dependencies.GraphModel;
    formatters = dependencies.formatters;
    GraphModel.extend(Record);
};
