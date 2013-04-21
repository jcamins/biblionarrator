$(document).ready(function () {
    // Cookie toggle code
    $('[data-toggle="cookie-view"]').click(function () {
        var target = $($(this).attr('data-target'));
        var activeclass = $(this).attr('data-class')
        var isactive;
        if (this.nodeName === 'INPUT') {
            isactive = $(this).prop('checked');
        } else {
            $(this).parent().toggleClass('active');
            isactive = $(this).parent().hasClass('active');
        }

        if (isactive) {
            jQuery.cookie($(this).attr('data-cookie'), '1');
            if (activeclass) {
                target.addClass(activeclass);
            } else {
                target.show();
            }
        } else {
            jQuery.cookie($(this).attr('data-cookie'), '0');
            if (activeclass) {
                target.removeClass(activeclass);
            } else {
                target.hide();
            }
        }
        target.trigger('cookietoggle');
    }).each(function () {
        var target = $($(this).attr('data-target'));
        var activeclass = $(this).attr('data-class')
        var enabled = $(this).attr('data-default') == 'enabled' ?
            (jQuery.cookie($(this).attr('data-cookie')) != '0') :
            (jQuery.cookie($(this).attr('data-cookie')) == '1');
        if (enabled) {
            if (this.nodeName == 'INPUT') {
                $(this).prop('checked', true);
            } else {
                $(this).parent().addClass('active');
            }
            if (activeclass) {
                target.addClass(activeclass);
            } else {
                target.show();
            }
        } else {
            if (this.nodeName == 'INPUT') {
                $(this).prop('checked', false);
            } else {
                $(this).parent().removeClass('active');
            }
            if (activeclass) {
                target.removeClass(activeclass);
            } else {
                target.hide();
            }
        }
        target.trigger('cookietoggle');
    });

    // Dropdown-select code
    $('[data-toggle="dropdown-select"]').each(function () {
        var container = this;
        $(container).addClass('dropdown');
        $(container).append('<a href="#" data-toggle="dropdown" class="dropdown-toggle"><span class="cur-val"></span> <b class="caret"></b></a><ul class="dropdown-menu select-menu"></ul>');
        var select = $(this).find('select');
        var cur = $(this).find('.cur-val');
        var list = $(this).children('ul');
        var title = $(select).attr('title');
        if (typeof title === 'undefined') {
            title = '';
        }
        $(select).hide();
        $(select).find('option').each(function (index) {
            if ($(this).attr('data-placeholder') == 'true') {
                $(cur).text($(this).text());
            } else if ($(this).attr('selected') == 'selected') {
                $(cur).text(title + $(this).text());
                $(container).attr('data-index', index);
                $(list).append('<li class="selected" data-index="' + index + '"><a href="#">' + $(this).text() + '</a></li>');
            } else {
                $(list).append('<li data-index="' + index + '"><a href="#">' + $(this).text() + '</a></li>');
            }
        });
        if ($(cur).text().length === 0) {
            $(cur).text(title);
        }
        $(list).on('click', 'a', null, function () {
            var newindex = $(this).parent().attr('data-index');
            $(list).find('.selected').removeClass('selected');
            $(this).parent().addClass('selected');
            $(container).attr('data-index', newindex);
            $(cur).text(title + $(this).text());
            $(select).val([]);
            $(select).find('option').removeAttr('selected');
            $(select).find('option:eq(' + newindex + ')').attr('selected', 'selected');
            $(select).change();
            $(container).removeClass('open');
            return false;
        });
    });

    // Confirmation triggers
    $('[data-toggle="confirm"]').click(function () {
        $('#confirmLabel').text($(this).attr('data-confirm-label'));
        $('#confirmBody').text($(this).attr('data-confirm-body'));
        $('#confirmOK').attr('data-callback', $(this).attr('id'));
        $('#confirm').modal('show');
        return false;
    });
    $('#confirm').keydown(function (ev) {
        if (ev.keyCode == 13) {
            $(this).find('.btn-ok').click();
        }
    });
    $('#confirmOK').click(function () {
        if (typeof $(this).attr('data-callback') !== 'undefined' && $(this).attr('data-callback').length > 0) {
            $('#' + $(this).attr('data-callback')).trigger('confirmed');
            $('#confirm').modal('hide');
        }
    });
    $('#confirm').on('hidden', function () {
        $(this).removeAttr('data-callback');
    });
});

(function( $ ) {
    $.fn.extend({
        typeaheaddone: function( data, fn ) {
            this.on( 'keydown', function (ev) {
                if (ev.which == 13) {
                    $(this).trigger( 'typeahead:selected', { 'value': $(this).val() } );
                    return false;
                }
            });
            return arguments.length > 0 ?
                this.on( 'typeahead:autocompleted typeahead:selected', null, data, fn ) :
                $(this).trigger( 'typeahead:selected' );
        },

        tagger: function( options ) {
            if (typeof $(this).attr('data-tagger') !== 'undefined') {
                return;
            }
            var container = this;
            var input = $(this).find('input');
            if (typeof options.labelclass === 'undefined') {
                options.labelclass = 'tag-label';
            }
            var ta = $(input).clone();
            $(container).attr('data-tagger', 'on');
            $(ta).removeAttr('name');
            $(ta).removeAttr('id');
            $(ta).addClass('tagger-typeahead');
            $(ta).val('');
            $(container).append(ta);
            $(input).attr('type', 'hidden');
            var mytypes = $(input).val().match(/@[^@#]*#/g);
            for (var ii in mytypes) {
                if (mytypes[ii].length > 2) {
                    var curtype = mytypes[ii].replace('@', '').replace('#', '');
                    $(container).append('<span data-value="' + curtype + '" class="' + options.labelclass + '">' + curtype + ' <a href="#" class="remove-tag">&times;</a></span>');
                }
            }
            $(ta).typeahead(options.typeahead);
            $(ta).typeaheaddone(function (ev, datum) {
                if ($(input).val().indexOf('@' + datum.value + '#') === -1) {
                    $(container).append('<span data-value="' + datum.value + '" class="' + options.labelclass + '">' + datum.value + ' <a href="#" class="remove-tag">&times;</a></span>');
                    $(input).val($(input).val() + '@' + datum.value + '#');
                }
                $(ta).typeahead('setQuery', '');
            });
            $(container).on('click', '.remove-tag', null, function () {
                $(input).val($(input).val().replace('@' + $(this).parent().attr('data-value') + '#'));
                $(this).parent().remove();
            });
        },
    });
})( jQuery );

var tocindex;
var toctree;

function traverseTOC(node, depth) {
    $(node).find('span, a').each(function () {
        if ($(this).attr('data-match') || typeof $(this).attr('class') === 'undefined') {
            return;
        }
        var classes = $(this).attr('class').split(' ');
        var closestParentMatch = $(this).parents('a[data-match], span[data-match]').first().attr('data-match');
        var closestParent = $(tocTree).find('li[data-match="' + closestParentMatch + '"] > ul');
        if (closestParent.length > 0) {
            closestParent = closestParent.first();
        } else {
            closestParent = $(tocTree).find('ul').first();
        }
        for (var ii = 0, len = classes.length; ii < len; ++ii) {
            var value = $(this).text();
            if (typeof(fieldlist[classes[ii]]) !== 'undefined' && value.length > 0) {
                $(this).attr('data-match', tocindex);
                closestParent.append('<li aria-labelledby="labelField' + tocindex + '" data-match="' + tocindex + '" class="fieldEntry' + '"><a id="labelField' + tocindex + '" class="toclabel">' + fieldlist[classes[ii]].label + '</a><ul><li><a class="tocvalue">' + value + '</a></li></ul></li>');
            }
        }
        tocindex++;
    });
}

var attrs = [ 'href', 'role', 'itemscope', 'itemtype', 'itemid', 'itemprop', 'itemref' ];

function html2raw(element) {
    var object, childs = element.childNodes;
    object = {};

    if (childs.length > 0) {
        var children = [];
        for (var i = 0; i < childs.length; i++) {
            if (childs[i].nodeType != 2) {
                children.push(html2raw(childs[i]));
            }
        }
        if (children.length > 0) {
            object['children'] = children;
        }
    }

    if (element.nodeType == 1) {
        var name = element.nodeName.toLowerCase();
        if ((name === 'span' || name === 'a') && typeof fieldlist[element.getAttribute('class')] !== 'undefined') {
            name = element.getAttribute('class');
        }
        if (typeof fieldlist[name] !== 'undefined' && fieldlist[name].link) {
            object['link'] = '';
        }
        for (var i=0, atts=element.attributes, l=atts.length; i<l; i++) {
            if (atts.item(i).nodeName === 'href' && typeof fieldlist[name] !== 'undefined' && fieldlist[name].link && atts.item(i).nodeValue.indexOf('/record/') > -1) {
                object['link'] = atts.item(i).nodeValue.substr(atts.item(i).nodeValue.lastIndexOf('/') + 1);
            } else if (jQuery.inArray(atts.item(i).nodeName, attrs) >= 0 && atts.item(i).nodeValue.length > 0) {
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
}

var htmlelements = [ 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'command', 'datalist', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr' ];

function raw2html(object) {
    var output = '';
    if (typeof object === 'string') {
        output = object;
    } else {
        for (var elem in object) {
            var htmlelem = elem;
            if (typeof object[elem] == 'undefined') {
                continue
            }
            if (jQuery.inArray(elem, htmlelements) < 0) {
                if (typeof object[elem]['link'] === 'undefined') {
                    htmlelem = 'span';
                } else {
                    htmlelem = 'a';
                }
                output += '<' + htmlelem + ' class="' + elem + '"';
            } else {
                output += '<' + elem;
            }
            for (var attr in object[elem]) {
                if (jQuery.inArray(attr, attrs) >= 0 && object[elem][attr].length > 0) {
                    output += ' ' + attr + '="' + object[elem][attr] + '"';
                }
            }
            output += '>';
            for (var child in object[elem]['children']) {
                output += raw2html(object[elem]['children'][child]);
            }
            output += '</' + htmlelem + '>';
        }
    }
    return output;
}

function updateFieldsTOCTree(node) {
    tocindex = 1;
    $('#fieldsTOC').remove();
    tocTree = document.createElement('div');
    $(tocTree).attr('id', 'fieldsTOC');
    $(tocTree).append('<ul></ul>');
    $('#recordContainer span, #recordContainer a').each(function () {
        $(this).removeAttr('data-match');
    });
    traverseTOC($('#recordContainer'), 1);
    $('#table-of-contents').append(tocTree);
    initializeTOC();
}

function initializeTOC() {
    $('#fieldsTOC').jstree({
        "plugins" : [ "themes", "html_data", "types", "ui" ],
        "themes" : { "icons": false },
    });
    $('#fieldsTOC').bind('select_node.jstree', function (e, data) {
        $('#recordContainer span, #recordContainer a').each(function () { $(this).removeClass('highlight') });
        var obj = data.rslt.obj[0];
        while (typeof(obj) !== 'undefined' && !obj.hasAttribute('data-match')) {
            obj = obj.parentNode;
        }
        if (typeof(obj) !== 'undefined' && obj.hasAttribute('data-match')) {
            $('#recordContainer span[data-match="' + obj.getAttribute('data-match') + '"], #recordContainer a[data-match="' + obj.getAttribute('data-match') + '"]').addClass('highlight');
            return false;
        }
    });
    $('#fieldsTOC').bind('deselect_node.jstree', function (e, data) {
        $('#recordContainer span, #recordContainer a').each(function () { $(this).removeClass('highlight') });
    });
}

function addQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?|&])" + key + "=.*?(&|$)", "i");
    separator = uri.indexOf('?') !== -1 ? "&" : "?";
    return uri + separator + key + "=" + value;
}

function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?|&])" + key + "=.*?(&|$)", "i");
    separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
        return uri + separator + key + "=" + value;
    }
}
