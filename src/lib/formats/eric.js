
module.exports.snippet = function(recorddata) {
    return recorddata;
};

function stringify (object) {
    var string = '';
    if (typeof object !== 'object') {
        return object;
    }
    for (var el in object) {
        string = string + ' ' + stringify(object[el]);
    }
    return string;
}

module.exports.indexes = function(recorddata) {
    return {
        key: recorddata.metadata.dc_identifier.eric_accno[0],
        title: recorddata.metadata.dc_title,
        source: recorddata.metadata.dc_source,
        citation: recorddata.metadata.dc_citation,
        description: recorddata.metadata.dc_description,
        publisher: recorddata.metadata.dc_publisher,
        keyword: stringify(recorddata)
    };
};


module.exports.links = function(recorddata) {
    var links = [ ];
    if (recorddata.metadata.dc_creator) {
        recorddata.metadata.dc_creator.personal.forEach(function (creator) {
            links.push({ key: creator, label: 'author',
                vivify: {
                    key: creator,
                    format: 'bnjson',
                    data: { "article":{ "children":[ { "header":{ "children":[ { "span":{ "children":[ creator ] } }, ] } }, ] } },
                    recordclass: 'person',
                    no_index: true,
                },
                properties: { target: creator, marker: creator }
            });
        });
        recorddata.metadata.dc_creator.institution.forEach(function (creator) {
            links.push({ key: creator, label: 'author',
                vivify: {
                    key: creator,
                    format: 'bnjson',
                    data: { "article":{ "children":[ { "header":{ "children":[ { "span":{ "children":[ creator ] } }, ] } }, ] } },
                    recordclass: 'institution',
                    no_index: true,
                },
                properties: { target: creator, marker: creator }
            });
        });
    }
    if (recorddata.metadata.dc_type) {
        recorddata.metadata.dc_type.forEach(function (type) {
            links.push({ key: type, label: 'recordtype',
                vivify: {
                    key: type,
                    format: 'bnjson',
                    data: { "article":{ "children":[ { "header":{ "children":[ { "span":{ "children":[ type ] } }, ] } }, ] } },
                    recordclass: 'recordtype',
                    no_index: true,
                },
                properties: { target: type, marker: type }
            });
        });
    }
    if (recorddata.metadata.dc_subject) {
        recorddata.metadata.dc_subject.forEach(function (subject) {
            links.push({ key: subject, label: 'subject',
                vivify: {
                    key: subject,
                    format: 'bnjson',
                    data: { "article":{ "children":[ { "header":{ "children":[ { "span":{ "children":[ subject ] } }, ] } }, ] } },
                    recordclass: 'subject',
                    no_index: true,
                },
                properties: { target: subject, marker: subject }
            });
        });
    }
    if (recorddata.metadata.dc_source) {
        links.push({ key: recorddata.metadata.dc_source, label: 'source_e',
            vivify: {
                key: recorddata.metadata.dc_source,
                format: 'bnjson',
                data: { "article":{ "children":[ { "header":{ "children":[ { "span":{ "children":[ recorddata.metadata.dc_source ] } }, ] } }, ] } },
                recordclass: 'citationsource',
                no_index: true,
            },
            properties: { target: recorddata.metadata.dc_source, marker: recorddata.metadata.dc_source }
        });
    }
    return links;
};

/*jshint unused:false */ /* Not yet implemented */
module.exports.decompile = function(htmldom) {
};
/*jshint unused:true */

module.exports.import = function (record, options, maps, matcher) {
    var rec = { metadata: { } };
    var newkey, key;
    for (key in record.metadata) {
        newkey = key.replace(':', '_');
        rec.metadata[newkey] = record.metadata[key];
    }
    var jj;
    var identifiers = { };
    if (rec.metadata.dc_identifier) {
        rec.metadata.dc_identifier.forEach(function (el) {
            if (el.$text) {
                key = el.$.scheme;
                newkey = key.replace(':', '_');
                identifiers[newkey] = identifiers[newkey] || [ ];
                identifiers[newkey].push(el.$text);
            }
        });
        rec.metadata.dc_identifier = identifiers;
    }
    var creators = { personal: [ ], institution: [ ] };
    if (rec.metadata.dc_creator) {
        rec.metadata.dc_creator.forEach(function (el) {
            if (el.$text) {
                if (el.$.scheme === 'personal author') {
                    creators.personal.push(el.$text);
                } else if (el.$.scheme === 'institution') {
                    creators.institution.push(el.$text);
                } else {
                    console.log('Unknown creator scheme: ' + el.$.scheme);
                }
            }
        });
       rec.metadata.dc_creator = creators;
    }
    var types = [ ];
    if (rec.metadata.dc_type) {
        rec.metadata.dc_type.forEach(function (el) {
            if (typeof el === 'object' && el !== null) {
                types.push(el.$text);
            } else if (typeof el === 'string' && el.length > 0) {
                types.push(el);
            }
        });
        rec.metadata.dc_type = types;
    }
    var subjects = [ ];
    if (rec.metadata.dc_subject) {
        rec.metadata.dc_subject.forEach(function (el) {
            if (typeof el === 'object' && el !== null) {
                subjects.push(el.$text);
            } else if (typeof el === 'string' && el.length > 0) {
                subjects.push(el);
            }
        });
        rec.metadata.dc_subject = subjects;
    }
    return { format: 'eric', data: rec, recordclass: 'biblio' };
};

module.exports.importoptions = {
    importer: 'xml',
    xml: {
        collect: [
            'dc:creator',
            'dc:subject',
            'dc:type',
            'dc:identifier',
            'dcterms:educationLevel'
        ],
        recordElement: 'record'
    }
};
