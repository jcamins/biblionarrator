"use strict";
var models,
    extend = require('extend'),
    graphstore = require('../lib/environment').graphstore,
    g = graphstore.g,
    GraphModel = require('../lib/graphmodel'),
    formatters = require('../lib/formats');

/**
 * Represents a single record.
 * @constructor
 * @param {object} data - object to reify as a Record model
 *
 */
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
        } else {
            return formatters[this.format].render(this.data);
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
            data: formatters[this.format].snippet(this.data),
        });
    };

    /**
     * Link the record to another record
     * @param {string} type type of link to create
     * @param {Record|string} target Record object or ID of record to link to
     */
    this.link = function (type, target) {
        if (typeof target === 'undefined' || target === null || target === '') {
            return;
        }
        var sv = g.v(this.id).iterator().nextSync();
        var tv = g.v(typeof target === 'string' ? target : target.id).iterator().nextSync();
        graphstore.db.addEdgeSync(null, sv, tv, type);
        sv.setPropertySync('vorder', sv.getPropertySync('vorder'));
        tv.setPropertySync('vorder', tv.getPropertySync('vorder') + 1);
        if (graphstore.autocommit) {
            graphstore.db.commitSync();
        }
    };

    this.getLinks = function () {
        if (typeof formatters[this.format] === 'undefined') {
            return [];
        } else {
            return formatters[this.format].links(this.data);
        }
    };

    this.initialize(data);

    if (typeof formatters[this.format] !== 'undefined') {
        extend(this, formatters[this.format].indexes(this.data));
    }

    return this;
}

Record.model = 'record';

module.exports = Record;

GraphModel.extend(Record);

Record.init = function(ref) {
    models = ref;
};
