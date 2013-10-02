
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

/*jshint unused:false */ /* Not yet implemented */
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
/*jshint unused:true */
