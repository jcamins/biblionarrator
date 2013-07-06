var Q = require('q'),
    models;

module.exports = Bookmarks;

function Bookmarks() {
    var deferred = Q.defer();

    this.length = 1;
    deferred.resolve(this);

    return deferred.promise;
};

Bookmarks.init = function (ref) {
    models = ref;
};
