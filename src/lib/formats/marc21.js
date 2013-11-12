var MARCRecord = require('marcrecord'),
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

module.exports.indexes = function(recorddata, recordclass) {
    var indexes = { keyword: stringify(recorddata) };
    var record = new MARCRecord(recorddata);
    var val;
    if (!environment.formats || !environment.formats.marc || !environment.formats.marc[recordclass] || !environment.formats.marc[recordclass].indexes) {
        return indexes;
    }
    var field2index = environment.formats.marc[recordclass].indexes;
    if (!field2index[0].re) {
        field2index.forEach(function (index) {
            index.re = new RegExp(index.tag);
        });
    }
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
        if (typeof indexes[idx] === 'string') {
            indexes[idx] = indexes[idx].trim();
        }
    }
    return indexes;
};

var cleanre = new RegExp('[.,:/; \t]+$');

module.exports.links = function(recorddata, recordclass) {
    var links = [ ];
    if (!environment.formats || !environment.formats.marc || !environment.formats.marc[recordclass] || !environment.formats.marc[recordclass].links) {
        return links;
    }
    var field2link = environment.formats.marc[recordclass].links;
    if (!field2link[0].re) {
        field2link.forEach(function (link) {
            link.re = new RegExp(link.tag);
        });
    }
    var record = new MARCRecord(recorddata);
    var generated = { };
    for (var ii = 0; ii < record.fields.length; ii++) {
        field2link.forEach(function (def) {
            if (record.fields[ii].tag.match(def.re)) {
                var key = record.fields[ii].string(def.subfields);
                key = key.replace(cleanre, '');
                if (typeof generated[def.label + '^' + key] === 'undefined') {
                    var link = { key: key, label: def.label, vivify: {
                        key: key,
                        data: { "article":{"children":[{"header":{"children":[ key ]}},{"section":{"children":["&nbsp;"]}}]}},
                        format: 'bnjson',
                        recordclass: def.type
                    }};
                    if (def.noindex) link.vivify.no_index = true;
                    if (def.match) {
                        link.match = { };
                        for (var idx in def.match) {
                            link.match[idx] = record.fields[ii].string(def.match[idx]);
                        }
                    }
                    link.properties = { target: key };
                    if (def.marker) {
                        link.properties.marker = record.fields[ii].string(def.subfields);
                    } 
                    links.push(link);
                    generated[def.label + '^' + key] = true;
                }
            }
        });
    }
    return links;
};

/*jshint unused:false */ /* Not yet implemented */
module.exports.decompile = function(htmldom) {
};
/*jshint unused:true */
