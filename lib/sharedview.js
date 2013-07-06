var Q = require('q'),
    models = require('../models'),
    Template = models.Template,
    Bookmarks = models.Bookmarks;

module.exports = function () {
    var deferred = Q.defer();
    var data = {};
    Q.all([ Template.all(), new Bookmarks() ]).then(function (defdata) {
        data.templates = defdata[0];
        data.bookmarks = defdata[1];
        deferred.resolve(data);
    });
    return deferred.promise;
};
