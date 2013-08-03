var Q = require('q'),
    models,
    datastore = require('../lib/datastore');

module.exports = RecordList;

function RecordList() {
    var me = this;

    this.search = function(query) {
        var deferred = Q.defer();

        datastore.query('SELECT records.*, recordtypes.name AS recordtype FROM records LEFT JOIN recordtypes ON (records.recordtype_id = recordtypes.id) WHERE deleted = 0 AND data LIKE ?', ['%' + query + '%'], function(err, results, fields) {
            if (err) {
                deferred.reject(err);
            } else {
                me.mainfacet = {};
                me.records = [];
                me.total = results.length;
                me.count = results.length;
                var promises = [];
                for (var idx in results) {
                    promises.push(new models.Record(results[idx]));
                }
                Q.all(promises).then(function(records) {
                    for (var idx in records) {
                        records[idx].rendered = records[idx].render();
                        records[idx].number = parseInt(idx, 10) + 1;
                        records[idx].facet = records[idx].recordtype;
                        me.records.push(records[idx]);
                        me.mainfacet[records[idx].recordtype] = (parseInt(me.mainfacet[records[idx].recordtype], 10) || 0) + 1;
                    }
                    deferred.resolve(me);
                });
            }
        });
        return deferred.promise;
    };

    this.fromlinks = function(links) {
        var deferred = Q.defer();
        me.mainfacet = {};
        me.records = [];
        var promises = [];
        for (var idx in links) {
            if (links[idx].type === 'In') {
                promises.push(links[idx].source());
            } else {
                promises.push(links[idx].target());
            }
        }
        Q.all(promises).then(function(records) {
            var seen = {};
            var number = 1;
            for (var idx in records) {
                if (typeof seen[records[idx].id] === 'undefined') {
                    seen[records[idx].id] = 1;
                    records[idx].rendered = records[idx].render();
                    records[idx].number = number++;
                    records[idx].facet = links[idx].label;
                    me.records.push(records[idx]);
                    me.mainfacet[links[idx].type] = (parseInt(me.mainfacet[links[idx].type], 10) || 0) + 1;
                }
            }
            me.total = me.records.length;
            me.count = me.records.length;
            deferred.resolve(me);
        });
        return deferred.promise;
    };
}

RecordList.init = function(ref) {
    models = ref;
};
