"use strict";
var models,
    extend = require('extend'),
    environment = require('../lib/environment'),
    graphstore = environment.graphstore,
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
        } else {
            return environment.renderer.render(this.template || (this.format + '_' + this.recordclass), { record: this.data });
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

    /**
     * Link the record to another record
     * @param {string} type type of link to create
     * @param {Record|string} target Record object or ID of record to link to
     */
    this.link = function (type, target, properties, reverse) {
        try {
            if (typeof target === 'undefined' || target === null || target === '') {
                return;
            }
            var sv = g.v(this.id).iterator().nextSync();
            var tv = g.v(typeof target === 'string' || typeof target === 'number' ? target : target.id).iterator().nextSync();
            var edge;
            if (reverse) {
                edge = graphstore.db.addEdgeSync(null, tv, sv, type);
            } else {
                edge = graphstore.db.addEdgeSync(null, sv, tv, type);
            }
            if (typeof properties === 'object' && properties !== null) {
                for (var prop in properties) {
                    if (properties.hasOwnProperty(prop) && typeof properties[prop] !== 'function' && typeof properties[prop] !== 'undefined') {
                        if (typeof properties[prop] === 'object') {
                            edge.setPropertySync(prop, JSON.stringify(properties[prop]));
                        } else {
                            edge.setPropertySync(prop, properties[prop]);
                        }
                    }
                }
            }
            sv.setPropertySync('vorder', sv.getPropertySync('vorder') + 1);
            tv.setPropertySync('vorder', tv.getPropertySync('vorder') + 1);
            if (graphstore.autocommit) {
                graphstore.db.commitSync();
            }
        } catch (e) {
            return;
        }
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

    this.mergeIndexes();

    if (typeof this.no_index !== 'undefined') {
        delete this.no_index;
    }

    return this;
}

Record.model = 'record';

module.exports = Record;

GraphModel.extend(Record);

Record.init = function(ref) {
    models = ref;
};
