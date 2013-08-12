var Q = require('q');/*,
    models = require('../models'),
    Template = models.Template;*/

module.exports = function() {
    var deferred = Q.defer();
    var data = { templates: [ ] };
    //Template.all().then(function(templates) {
    //    data.templates = templates;
        deferred.resolve(data);
    //});
    return deferred.promise;
};
