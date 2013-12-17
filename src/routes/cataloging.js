"use strict";

var environment = require('../lib/environment'),
    models = require('../models'),
    LongEncoding = environment.graphstore.g.java.import('com.thinkaurelius.titan.util.encoding.LongEncoding'),
    socketserver = require('../lib/socketserver'),
    ZOOMStream,
    marcjs = require('marcjs'),
    Field = models.Field;

try {
    ZOOMStream = require('zoomstream');
} catch (e) {
}
exports.suggest = function(req, res) {
    if (typeof req.query.q !== 'undefined' && req.query.q) {
        var query = { query: { match_phrase_prefix: { } }, fields: environment.esclient.fields };
        query.query.match_phrase_prefix[environment.indexes['key'].id] = req.query.q;
        environment.esclient.search(environment.esclient.indexname, 'vertex', query, function (err, data) {
            if (typeof data === 'string') data = JSON.parse(data);
            var records = [ ];
            var count = 0;
            if (typeof data.hits !== 'undefined' && data.hits.total > 0) {
                count = data.hits.total;
                data.hits.hits.forEach(function (hit) {
                    var rec = { };
                    rec._id = LongEncoding.decodeSync(hit._id);
                    for (var key in hit.fields) {
                        rec[environment.esclient.index[key]] = hit.fields[key];
                    }
                    records.push(rec);
                });
            }
            res.json({ count: count, records: records });
        });
    } else {
        res.json({ count: 0, records: [ ] });
    }
};

exports.copy = function(req, res) {
    if (ZOOMStream) {
        var stream = new marcjs.MarcxmlReader(new ZOOMStream('lx2.loc.gov:210/LCDB', decodeURIComponent(req.query.q)));
        var records = [ ];
        stream.on('data', function (rec) {
            records.push(marcjs.MiJWriter.toMiJ(rec));
        });
        stream.on('end', function () {
            res.json({ format: 'marc21', records: records });
        });
    } else {
        res.json({ format: 'marc21', records: [ ] });
    }
};

exports.bulk = function (req, res) {
    var data = { view: 'cataloging' };
    Field.all(function (err, fieldmap) {
        data.fields = [ ];
        for (var field in fieldmap) {
            data.fields.push(fieldmap[field]);
        }
        res.render('record/bulkentry', data);
    });
};
