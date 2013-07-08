
var attrs = [ 'href', 'role', 'itemscope', 'itemtype', 'itemid', 'itemprop', 'itemref' ];
var htmlelements = [ 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'command', 'datalist', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr' ];

var dom2raw = function (element) {
    var object, childs = element.childNodes;
    object = {};
    var i;

    if (childs.length > 0) {
        var children = [];
        for (i = 0; i < childs.length; i++) {
            if (childs[i].nodeType != 2) {
                children.push(dom2raw(childs[i]));
            }
        }
        if (children.length > 0) {
            object.children = children;
        }
    }

    if (element.nodeType == 1) {
        var name = element.nodeName.toLowerCase();
        if ((name === 'span' || name === 'a') && typeof fieldlist[element.getAttribute('class')] !== 'undefined') {
            name = element.getAttribute('class');
        }
        if (typeof fieldlist[name] !== 'undefined' && fieldlist[name].link) {
            object.link = '';
        }
        for (i=0, atts=element.attributes, l=atts.length; i<l; i++) {
            if (atts.item(i).nodeName === 'href' && typeof fieldlist[name] !== 'undefined' && fieldlist[name].link && atts.item(i).nodeValue.indexOf('/record/') > -1) {
                object.link = atts.item(i).nodeValue.substr(atts.item(i).nodeValue.lastIndexOf('/') + 1);
            } else if (attrs.indexOf(atts.item(i).nodeName) >= 0 && atts.item(i).nodeValue.length > 0) {
                object[atts.item(i).nodeName] = atts.item(i).nodeValue;
            }
        }
        var inner = object;
        object = {};
        object[name] = inner;
    } else if (element.nodeType == 3) {
        return element.nodeValue;
    }
    return object;
};

var raw2html = function(object) {
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
};

module.exports.render = function (recorddata) {
    return raw2html(recorddata);
};

module.exports.snippet = function (recorddata) {
    var snippetdata = { article: { children: [ ] } };
    for (var idx in recorddata.article.children) {
        snippetdata.article.children.push(recorddata.article.children[idx]);
        if (typeof recorddata.article.children[idx].header !== 'undefined') {
            break;
        }
    }
    return snippetdata;
};

module.exports.indexes = function (recorddata) {
};

module.exports.links = function (recorddata) {
};

module.exports.decompile = function (htmldom) {
    return dom2raw(htmldom);
};
