module.exports.render = function(recorddata) {
    var ii;
    var rendered = '<article><header><span class="dc_title">' + recorddata.metadata.dc_title + '</span> (<span class="eric_accno">' + recorddata.metadata.dc_identifier.eric_accno + '</span>)';
    if (recorddata.metadata.dc_creator) {
        rendered = rendered + '<div>';
        if (recorddata.metadata.dc_creator.personal) {
            recorddata.metadata.dc_creator.personal.forEach(function (creator) {
                rendered = rendered + '<span class="dc_creator">' + creator + '</span>; ';
             });
        }
        if (recorddata.metadata.dc_creator.institution) {
            recorddata.metadata.dc_creator.institution.forEach(function (creator) {
                rendered = rendered + '<span class="dc_creator">' + creator + '</span>; ';
             });
        }
        rendered = rendered + '</div>';
    }
    if (recorddata.metadata.dc_source) {
        rendered = rendered + '<div><span class="dc_source">' + recorddata.metadata.dc_source + '</span>';
        if (recorddata.metadata.eric_citation) {
            rendered = rendered + ' <span class="eric_citation">' + recorddata.metadata.eric_citation + '</span>';
        }
        rendered = rendered + '</div>';
    }
    if (recorddata.metadata.dc_description) {
        rendered = rendered + '<span class="dc_description">' + recorddata.metadata.dc_description + '</span>';
    }
    rendered = rendered + '</header>';
    if (recorddata.metadata.dc_publisher) {
        rendered = rendered + '<section>';
        if (recorddata.metadata.dc_publisher) {
            rendered = rendered + '<span class="dc_publisher">' + recorddata.metadata.dc_publisher + '</span>. ';
        } 
        rendered = rendered + '</section>';
    }
    if (recorddata.subjects) {
        rendered = rendered + '<section><em>Subjects:</em><ul>';
        for (ii in recorddata.subjects) {
            rendered = rendered + '<li><span class="dc_subject">' + recorddata.subjects[ii] + '</span></li>';
        }
        rendered = rendered + '</ul></section>';
    }
    if (recorddata.types) {
        rendered = rendered + '<section><em>Publication type:</em><ul>';
        for (ii in recorddata.types) {
            rendered = rendered + '<li><span class="dc_type">' + recorddata.types[ii] + '</span></li>';
        }
        rendered = rendered + '</ul></section>';
    }
    rendered = rendered + '</article>';
    return rendered;
};

module.exports.snippet = function(recorddata) {
    var rendered = '<article><header><span class="dc_title">' + recorddata.title + '</span> (<span class="eric_accno">' + recorddata.accno + '</span>)';
    if (recorddata.creator) {
        rendered = rendered + '<div>';
        for (var ii in recorddata.creator) {
            rendered = rendered + '<span class="dc_creator">' + recorddata.creator[ii] + '</span>; ';
        }
        rendered = rendered + '</div>';
    }
    if (recorddata.source) {
        rendered = rendered + '<div><span class="dc_source">' + recorddata.source + '</span>';
        if (recorddata.citation) {
            rendered = rendered + ' <span class="eric_citation">' + recorddata.citation + '</span>';
        }
        rendered = rendered + '</div>';
    }
    if (recorddata.description) {
        rendered = rendered + '<span class="dc_description">' + recorddata.description + '</span>';
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


/*jshint unused:false */ /* Not yet implemented */
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

module.exports.decompile = function(htmldom) {
};
/*jshint unused:true */
