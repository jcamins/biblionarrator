var fs = require('fs'),
    MARCRecord = require('../marcrecord'),
    environment;
if (typeof window === 'undefined') {
    environment = require('../environment');
} else {
    environment = window.environment;
}
var inspect = require('eyes').inspector({maxLength: false});

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
    { re: new RegExp('008'), index: 'year', subfields: '07-10', datatype: 'Integer' },
    { re: new RegExp('033'), index: 'adate', subfields: 'a' },
    { re: new RegExp('[17](00|10|11)'), index: 'author', subfields: 'abcdfghijklmnopqrstu' },
    { re: new RegExp('24.'), index: 'title', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('245'), index: 'titleproper', subfields: 'a' },
    { re: new RegExp('245'), index: 'titleremainder', subfields: 'bcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('246'), index: 'titlevariant', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('250'), index: 'edition', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('260'), index: 'place', subfields: 'a' },
    { re: new RegExp('260'), index: 'publisher', subfields: 'b' },
    { re: new RegExp('(4[49]0|830)'), index: 'series', subfields: 'abcdefghijklmnopqrstuvwxyz' },
    { re: new RegExp('5..'), index: 'note', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('6..'), index: 'subject', subfields: 'abcdfghijklmnopqrstuvwxyz' },
    { re: new RegExp('773'), index: 'host', subfields: 'abcdfghijklmnopqrstuvwxyz' },
];

module.exports.indexes = function(recorddata) {
    var indexes = { keyword: stringify(recorddata) };
    var record = new MARCRecord(recorddata);
    var val;
    for (var ii = 0; ii < record.fields.length; ii++) {
        field2index.forEach(function (def) {
            if (record.fields[ii].tag.match(def.re)) {
                indexes[def.index] = indexes[def.index] || '';
                val = record.fields[ii].string(def.subfields);
                if (def.datatype === 'Integer') {
                    val = val.replace(/[^0-9]/g, '0');
                    indexes[def.index] = parseInt(val, 10);
                } else {
                    indexes[def.index] = indexes[def.index] + val + ' ';
                }
            }
        });
    }
    for (var idx in indexes) {
        indexes[idx] = indexes[idx].trim();
    }
    return indexes;
};

var field2link = [
    { re: new RegExp('008'), link: 'year_e', subfields: '07-10', type: 'authstub' },
    { re: new RegExp('[17](00|10|11)'), link: 'author_e', subfields: 'abcdfghijklmnopqrstu', type: 'authstub' },
    { re: new RegExp('(440|830)'), link: 'series_e', subfields: 'a', type: 'authstub' },
    { re: new RegExp('6..'), link: 'subject_e', subfields: 'abcdfghijklmnopqrstuvwxyz', type: 'authstub' },
    { re: new RegExp('6(00|10|11)'), link: 'subject_e', subfields: 'abcdfghijklmnopqrstuw', type: 'authstub' },
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
                    recordclass: def.type
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
