var Q = require('q'),
    models,
    connection = require('../lib/datastore').connection;

module.exports = RecordList;

function RecordList () {
    var me = this;

    this.search = function (query) {
        var deferred = Q.defer();

        connection.query('SELECT records.*, recordtypes.name AS recordtype FROM records LEFT JOIN recordtypes ON (records.recordtype_id = recordtypes.id) WHERE deleted = 0 AND data LIKE ?', [ '%' + query + '%' ], function (err, results, fields) {
            if (err) {
                deferred.reject(err);
            } else {
                me.mainfacet = { };
                me.records = [ ];
                me.total = results.length;
                me.count = results.length;
                var promises = [];
                for (var idx in results) {
                    promises.push(new Record(results[idx]));
                }
                Q.all(promises).then(function (records) {
                    for (var idx in records) {
                        records[idx].rendered = records[idx].render();
                        records[idx].number = parseInt(idx, 10) + 1;
                        me.records.push(records[idx]);
                        me.mainfacet[records[idx].recordtype] = (parseInt(me.mainfacet[records[idx].recordtype], 10) || 0) + 1;
                    }
                    deferred.resolve(me);
                });
            }
        });
        return deferred.promise;
    };
};

RecordList.init = function (ref) {
    models = ref;
};
