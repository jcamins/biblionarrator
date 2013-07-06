var Q = require('q'),
    models,
    connection = require('../lib/datastore').connection;

module.exports = Template;

function Template (data) {
    var createPromise = Q.defer();
    var me = this;

    if (typeof data === 'object') {
        for (var idx in data) {
            me[idx] = data[idx];
        }
        createPromise.resolve(me);
    } else if (typeof data === 'string') {
        connection.query('SELECT template.* FROM templates WHERE templates.id = ?', [ data ], function (err, results, fields) {
            for (var idx in fields) {
                me[fields[idx].name] = results[0][fields[idx].name];
            }
            if (err) {
                createPromise.reject(err);
            } else {
                createPromise.resolve(me);
            }
        });
    } else {
        createPromise.resolve(me);
    }
    return createPromise.promise;
}

Template.all = function () {
    var prom = Q.defer();
    connection.query('SELECT templates.* FROM templates', [ ], function (err, results, fields) {
        if (err) {
            prom.reject(err);
        } else {
            var list = [];
            for (var idx in results) {
                list.push(new Template(results[idx]));
            }
            Q.all(list).then(function (l) {
                prom.resolve(l);
            });
        }
    });
    return prom.promise;
};

Template.init = function (ref) {
    models = ref;
};

