var Q = require('q'),
    models,
    connection = require('../lib/datastore').connection;

module.exports = Record;

function Record (data) {
    var createPromise = Q.defer();
    var me = this;

    this.with = function (callback) {
        createPromise.promise.then(callback);
    };

    this.in = function (filter) {
        var Link = require('./link');
        var deferred = Q.defer();
        createPromise.promise.then(function (me) {
            connection.query('SELECT * FROM record_links WHERE target_id = ?', [ me.id ], function (err, results, fields) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var links = [];
                    for (var idx in results) {
                        links.push(new models.Link(results[idx].source_id, results[idx].target_id));
                    }
                    deferred.resolve(links);
                }
            });
        });
        this.with = function (callback) {
            deferred.promise.then(callback);
        };
        return this;
    };

    this.out = function (filter) {
        var Link = require('./link');
        var deferred = Q.defer();
        createPromise.promise.then(function (me) {
            connection.query('SELECT * FROM record_links WHERE source_id = ?', [ me.id ], function (err, results, fields) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var links = [];
                    for (var idx in results) {
                        links.push(new models.Link(results[idx].source_id, results[idx].target_id));
                    }
                    deferred.resolve(links);
                }
            });
        });
        this.with = function (callback) {
            deferred.promise.then(callback);
        };
        return this;
    };

    this.save = function () {
        var savePromise = Q.defer();
        createPromise.promise.then(function (me) {
            var query;
            if (me.id) {
                query = 'UPDATE records SET data = ?, recordtype_id = ? WHERE id = ?';
            } else {
                query = 'INSERT INTO records (data, recordtype_id) VALUES (?, ?)';
                me.id = '';
            }
            connection.query(query, [ me.data, me.recordtype_id, me.id ], function (err, results) {
                if (err) {
                    savePromise.reject(err);
                } else {
                    if (!me.id) {
                        me.id = results.insertId;
                    }
                    savePromise.resolve(me);
                }
            });
        });
        return savePromise.promise;
    };

    if (typeof data === 'object') {
        for (var idx in data) {
            me[idx] = data[idx];
        }
        createPromise.resolve(me);
    } else if (data !== 'new' && (typeof data === 'string' || typeof data === 'integer')) {
        connection.query('SELECT records.*, recordtypes.name AS recordtype FROM records LEFT JOIN recordtypes ON (recordtypes.id=records.recordtype_id) WHERE records.id = ?', [ data ], function (err, results, fields) {
            if (err) {
                createPromise.reject(err);
            } else {
                if (results.length > 0) {
                    for (var idx in fields) {
                        me[fields[idx].name] = results[0][fields[idx].name];
                    }
                }
                createPromise.resolve(me);
            }
        });
    } else {
        createPromise.resolve(me);
    }
    return createPromise.promise;
}

Record.init = function (ref) {
    models = ref;
};

Record.render = function (data) {
    if (typeof data === 'undefined' || data === null || data === '') {
        return '<article><header></header><section></section></article>';
    }
    return raw2html(JSON.parse(data));
}

var attrs = [ 'href', 'role', 'itemscope', 'itemtype', 'itemid', 'itemprop', 'itemref' ];
var htmlelements = [ 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'command', 'datalist', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr' ];

function raw2html(object) {
    console.log(object);
    var output = '';
    if (typeof object === 'string') {
        output = object;
    } else if (typeof object === 'undefined' || object === null) {
        return '';
    } else {
        for (var elem in object) {
            var htmlelem = elem;
            if (typeof object[elem] == 'undefined') {
                continue;
            }
            if (htmlelements.indexOf(elem) < 0) {
                if (typeof object[elem].link === 'undefined' && typeof object[elem].href === 'undefined') {
                    htmlelem = 'span';
                    if (object[elem].link !== '') {
                        object[elem].href = '/record/' + object[elem].link;
                    }
                } else {
                    htmlelem = 'a';
                }
                output += '<' + htmlelem + ' class="' + elem + '"';
            } else {
                output += '<' + elem;
            }
            for (var attr in object[elem]) {
                if (attrs.indexOf(attr) >= 0 && object[elem][attr].length > 0) {
                    output += ' ' + attr + '="' + object[elem][attr] + '"';
                }
            }
            output += '>';
            for (var child in object[elem].children) {
                output += raw2html(object[elem].children[child]);
            }
            output += '</' + htmlelem + '>';
        }
    }
    return output;
}
