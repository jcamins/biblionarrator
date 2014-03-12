
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
    var indexes = { key: recorddata.Name, keyword: stringify(recorddata) };
    if (recorddata.Attributes && recorddata.Attributes.ScopeNote) {
        indexes.scopenote = recorddata.Attributes.ScopeNote;
    }
    return indexes;
};

module.exports.links = function(recorddata) {
    var links = [];
    if (recorddata.Relationships.BT) {
        recorddata.Relationships.BT.forEach(function (bt) {
            links.push(relationshipLink(bt, 'term', 'broader'));
        });
    }
    if (recorddata.Relationships.RT) {
        recorddata.Relationships.RT.forEach(function (rt) {
            links.push(relationshipLink(rt, 'term', 'related'));
        });
    }
    if (recorddata.Relationships.U) {
        recorddata.Relationships.U.forEach(function (u) {
            links.push(relationshipLink(u, 'term', 'preferred'));
        });
    }
    return links;
};

function relationshipLink(term, recordtype, relationship) {
    return { key: term, label: relationship, properties: { target: term, marker: term } };
}

module.exports.decompile = function(htmldom) {
};

module.exports.import = function (term, options, maps, matcher) {
    var rec = { Name: term.Name, Attributes: { }, Relationships: { } };
    term.Attributes.Attribute.forEach(function (el) {
        if (el.$text) {
            rec.Attributes[el.$.name] = rec.Attributes[el.$.name] || [ ];
            rec.Attributes[el.$.name].push(el.$text);
        }
    });
    if (term.Relationships && term.Relationships.Relationship) {
        term.Relationships.Relationship.forEach(function (el) {
            rec.Relationships[el.$.type] = rec.Relationships[el.$.type] || [ ];
            el.Is.forEach(function (is) {
                if (typeof is === 'object' && is !== null) {
                    rec.Relationships[el.$.type].push(is.$text);
                } else if (typeof is === 'string' && is.length > 0) {
                    rec.Relationships[el.$.type].push(is);
                }
            });
        });
    }
    return { format: 'ericthesaurus', data: rec, recordclass: (rec.Attributes.RecType && rec.Attributes.RecType[0] === 'Main' ? 'term' : 'synonym') };
};

module.exports.importoptions = {
    importer: 'xml',
    xml: {
        collect: [
            'Attribute',
            'Relationship',
            'Is'
        ],
        recordElement: 'Term'
    }
};
