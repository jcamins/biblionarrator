var Q = require('q'),
    extend = require('extend'),
    models,
    datastore = require('../lib/datastore');

module.exports = Field;

function Field (data) {
    var createPromise = Q.defer();
    var self = this;

    self.save = function () {
        datastore.set('field', self.schema + '_' + self.field, self);
    };

    if (typeof data === 'object') {
        extend(self, data);
        createPromise.resolve(self);
    } else if (typeof data === 'string') {
        datastore.get('field', data, function (err, results) {
            if (err) {
                createPromise.reject(err);
            } else {
                extend(self, results);
                createPromise.resolve(self);
            }
        });
    } else {
        createPromise.resolve(self);
    }
    return createPromise.promise;
}

Field.all = function () {
    var prom = Q.defer();
    datastore.get('field', '*', function (err, results) {
        if (err) {
            prom.reject(err);
        } else {
            var list = [];
            for (var idx in results) {
                list.push(new Field(results[idx]));
            }
            Q.all(list).then(function (l) {
                prom.resolve(l);
            });
        }
    });
    return prom.promise;
};

Field.init = function (ref) {
    models = ref;
};
