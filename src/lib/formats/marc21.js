var fs = require('fs'),
    MARCRecord = require('../marcrecord'),
    environment;
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

var field2index = [
    { re: new RegExp('[17](00|10|11)'), index: 'author', subfields: 'abcdfghijklmnopqrstu' },
    { re: new RegExp('24.'), index: 'title', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('245'), index: 'titleproper', subfields: 'a' },
    { re: new RegExp('245'), index: 'titleremainder', subfields: 'bcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('246'), index: 'titlevariant', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('250'), index: 'edition', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('260'), index: 'publisher', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('5..'), index: 'note', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('6..'), index: 'subject', subfields: 'abcdfghijklmnopqrstuvwxyz' },
];

module.exports.indexes = function(recorddata) {
    var indexes = { keyword: stringify(recorddata) };
    var record = new MARCRecord(recorddata);
    for (var ii = 0; ii < record.fields.length; ii++) {
        field2index.forEach(function (def) {
            if (record.fields[ii].tag.match(def.re)) {
                indexes[def.index] = indexes[def.index] || '';
                indexes[def.index] = indexes[def.index] + record.fields[ii].string(def.subfields) + ' ';
            }
        });
    }
    return indexes;
};

var field2link = [
    { re: new RegExp('[17](00|10|11)'), link: 'author_e', subfields: 'abcdfghijklmnopqrstu' },
    { re: new RegExp('6..'), link: 'subject_e', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('6(00|10|11)'), link: 'subject_e', subfields: 'abcdfghijklmnopqrstuw' },
];

var cleanre = new RegExp('[.,:/; \t]+$');

module.exports.links = function(recorddata) {
    var links = [ ];
    var record = new MARCRecord(recorddata);
    for (var ii = 0; ii < record.fields.length; ii++) {
        field2link.forEach(function (def) {
            if (record.fields[ii].tag.match(def.re)) {
                var key = record.fields[ii].string(def.subfields);
                key = key.replace(cleanre, '');
                links.push({ key: key, link: def.link, vivify: {
                    key: key,
                    data: { "article":{"children":[{"header":{"children":[ key ]}},{"section":{"children":["&nbsp;"]}}]}},
                    format: 'bnjson',
                    recordclass: 'authstub'
                }});
            }
        });
    }
    return links;
};

/*jshint unused:false */ /* Not yet implemented */
module.exports.decompile = function(htmldom) {
};
/*jshint unused:true */
