module.exports.render = function(recorddata) {
    var ii;
    var rendered = '<article><header><span class="eric_term">' + recorddata.Name + '</span>';
    if (recorddata.scope) {
        rendered = rendered + '<span class="eric_scope">' + recorddata.Attributes.ScopeNote + '</span>';
    }
    rendered = rendered + '</header>';
    if (recorddata.Relationships.NT) {
        rendered = rendered + '<section><em>Narrower terms:</em><ul>';
        recorddata.Relationships.NT.forEach(function (narrower) {
            rendered = rendered + '<li><span class="eric_narrower">' + narrower + '</span></li>';
        });
        rendered = rendered + '</ul></section>';
    }
    if (recorddata.Relationships.BT) {
        rendered = rendered + '<section><em>Broader terms:</em><ul>';
        recorddata.Relationships.BT.forEach(function (broader) {
            rendered = rendered + '<li><span class="eric_broader">' + broader + '</span></li>';
        });
        rendered = rendered + '</ul></section>';
    }
    if (recorddata.Relationships.RT) {
        rendered = rendered + '<section><em>Related terms:</em><ul>';
        recorddata.Relationships.RT.forEach(function (related) {
            rendered = rendered + '<li><span class="eric_related">' + related + '</span></li>';
        });
        rendered = rendered + '</ul></section>';
    }
    if (recorddata.Relationships.U) {
        rendered = rendered + '<section><em>Instead of this term, use:</em><ul>';
        recorddata.Relationships.U.forEach(function (preferred) {
            rendered = rendered + '<li><span class="eric_preferred">' + preferred + '</span></li>';
        });
        rendered = rendered + '</ul></section>';
    }
    if (recorddata.Relationships.UF) {
        rendered = rendered + '<section><em>Synonyms:</em><ul>';
        recorddata.Relationships.UF.forEach(function (synonym) {
            rendered = rendered + '<li><span class="eric_synonyms">' + synonym + '</span></li>';
        });
        rendered = rendered + '</ul></section>';
    }
    rendered = rendered + '</article>';
    return rendered;
};

module.exports.snippet = function(recorddata) {
    var rendered = '<article><header><span class="eric_term">' + recorddata.name + '</span>';
    if (recorddata.scope) {
        rendered = rendered + '<span class="eric_scope">' + recorddata.scope + '</span>';
    }
    rendered = rendered + '</header></article>';
    return rendered;
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
