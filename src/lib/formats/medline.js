var environment;
if (typeof window === 'undefined') {
    environment = require('../environment');
} else {
    environment = window.environment;
}

module.exports.snippet = function(recorddata) {
    return recorddata;
};

function stringify (object) {
    var string = '';
    if (typeof object !== 'object') {
        return object;
    }
    for (var el in object) {
        if (el === 'ind1' || el === 'ind2') {
            continue;
        }
        string = string + ' ' + stringify(object[el]);
    }
    return string;
}

module.exports.indexes = function(recorddata) {
    var indexes = { keyword: stringify(recorddata) };
    return indexes;
};

/*jshint unused:false */ /* Not yet implemented */
module.exports.links = function(recorddata) {
    var links = [ ];
    return links;
};

module.exports.decompile = function(htmldom) {
};
/*jshint unused:true */

module.exports.import = function (record, options, maps, matcher) {
    var otherids = { };
    if (record.Article.OtherID) {
        record.Article.OtherID.forEach(function (el) {
            otherids[el.$.Source] = otherids[el.$.Source] || [ ];
            otherids[el.$.Source].push(el.$text);
        });
        record.Article.OtherID = otherids;
    }
    return { format: 'medline', data: record };
};

module.exports.importoptions = {
    importer: 'xml',
    collect: [
        'Author',
        'Chemical',
        'MeshHeading',
        'QualifierName',
        'OtherAbstract',
        'OtherId'
    ],
    recordElement: 'MedlineCitation'
};
