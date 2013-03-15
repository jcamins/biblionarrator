var appliers = {};

function initializeRangy() {
    rangy.init();
    for (var key in fieldlist) {
        appliers[key] = rangy.createCssClassApplier(key, {
                'elementTagName' : (fieldlist[key].link ? 'a' : 'span'),
                'normalize': true
        });
    }
};

function addTagDialog() {
    currentSelection = rangy.getSelection();
    $('#tagSelector').modal('show');
}

function replaceSelectionWithHtml(html) {
    var range, html;
    if (window.getSelection && window.getSelection().getRangeAt) {
        range = window.getSelection().getRangeAt(0);
        range.deleteContents();
        var div = document.createElement("div");
        div.innerHTML = html;
        var frag = document.createDocumentFragment(), child;
        while ( (child = div.firstChild) ) {
            frag.appendChild(child);
        }
        range.insertNode(frag);
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        html = (node.nodeType == 3) ? node.data : node.outerHTML;
        range.pasteHTML(html);
    }
}


function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    alert(html);
}


function closeAndOpenTag () {
    closeTag();
    addTagDialog();
}

function closeAllTags () {
    while (closeTag()) {};
}

function setTag(field) {
    $('#tagSelector').modal('hide');
    for(var ii = 0; ii < currentSelection.rangeCount; ii++) {
        appliers[labeltofieldlookup[field]].applyToRange(currentSelection.getRangeAt(ii));
    }
    consolidateStyles();
    updateFieldsTOCTree();
}

function closeTag() {
    var found = false;
    $(rangy.getSelection().getRangeAt(0).commonAncestorContainer).parents('span').each(function () {
        $(this).attr('class').split(' ').reverse().forEach(function (element, index, array) {
            if (typeof fieldlist[element] !== undefined) {
                appliers[element].undoToSelection();
                found = true;
            }
        });
    });
    updateFieldsTOCTree();
    return found;
}

function newRecord() {
    window.history.pushState({ 'event' : 'new' }, 'New record', '/record');
    $('#recordContainer').html('<article><header contenteditable="true"></header><section contenteditable="true"></section></article>');
}

function loadRecord() {
    $.ajax({
        type: "GET",
        url: "/xsl/raw2html.xsl",
        dataType: "xml",
        error: ajaxLoadFailed,
    }).done(function(xsl) {
        if (recordId) {
            $.ajax({
                type: "GET",
                url: "/record/" + recordId + '/raw',
                dataType: "xml",
                error: ajaxLoadFailed,
            }).done(function(msg) {
                var text = transformXML(msg, xsl).replace('&#160;', '&nbsp;');
                $('#recordContainer').html(text);
                addAlert('Successfully loaded record', 'success');
            });
        }
    });
}
function ajaxLoadFailed(jqXHR, err, msg) {
    addAlert('Failed to load record (' + err + ': ' + msg + ')', 'error');
}
function saveRecord() {
    $.ajax({
        type: "GET",
        url: "/xsl/html2raw.xsl",
        dataType: "xml",
        error: ajaxSaveFailed,
    }).done(function(xsl) {
        $.ajax({
            type: "POST",
            url: "/record/" + (typeof(recordId) === 'number' ? recordId : 'new'),
            data: { data: transformXML($('#recordContainer').html(), xsl) },
            error: ajaxSaveFailed,
        }).done(function(msg) {
            var obj = jQuery.parseJSON(msg);
            recordId = parseInt(obj.id);
            if (typeof(recordId) !== 'undefined') {
                window.history.replaceState({ 'event' : 'save', 'recordId' : recordId }, 'Record ' + recordId, '/record/' + recordId);
            }
            addAlert('Successfully saved record', 'success');
            updateFieldsTOCTree();
        });
    });
}
function ajaxSaveFailed(jqXHR, err, msg) {
    addAlert('Failed to save record (' + err + ': ' + msg + ')', 'alert');
}
function transformXML(xml, xsl) {
    var result;
    var parser = new DOMParser();
    if (!xml) {
        return "";
    } else if (typeof(xml) == 'string') {
        xml = parser.parseFromString(xml, "text/xml")
    }
    if (!xsl) {
        return "";
    } else if (typeof(xsl) == 'string') {
        xsl = parser.parseFromString(xsl, "text/xml")
    }
    if (window.ActiveXObject) {
        result = new ActiveXObject("MSXML2.DOMDocument");
        xml.transformNodeToObject(xsl, result);
    } else {    // Other browsers
        result = new XSLTProcessor();
        result.importStylesheet(xsl);
        result = result.transformToFragment(xml, document);
    }
    return (new XMLSerializer()).serializeToString(result);
}
function addAlert(msg, type) {
    $('#alerts').append('<div class="alert alert-' + type + '"><button type="button" class="close" data-dismiss="alert">&times;</button>' + msg + '</div>');
    $('#alerts .alert:not(:last-child)').fadeOut(400, function() { $(this).remove() });
}
function confirmNew() {
    $('#confirmNew').modal('hide');
    newRecord();
}
function confirmReload() {
    $('#confirmReload').modal('hide');
    loadRecord();
}
var tocindex;

function traverseTOC(node, depth) {
    var notclause = new Array(depth + 2).join(' span');
    var outerhtml = '';
    var innerhtml = '';
    var found = false;
    $(node).find('span').not('#recordContainer' . notclause).each(function () {
        if ($(this).attr('data-match')) {
            return;
        }
        var classes = $(this).attr('class').split(' ');
        for (var ii = 0, len = classes.length; ii < len; ++ii) {
            var value = $(this).text();
            if (typeof(fieldlist[classes[ii]]) !== 'undefined' && value.length > 0) {
                $(this).attr('data-match', tocindex);
                var currentNode;
                outerhtml += '<li aria-labelledby="labelField' + tocindex + '" data-match="' + tocindex + '" class="fieldEntry' + '"><a id="labelField' + tocindex + '" class="toclabel">' + fieldlist[classes[ii]].label + '</a><ul>';
                innerhtml += '<li><a class="tocvalue">' + value + '</a></li>';
                found = true;
            }
        }
        tocindex++;
        innerhtml += traverseTOC(this, depth + 1) + '</li></ul>';
        outerhtml += innerhtml;
        innerhtml = '';
    });

    if (outerhtml.length > 0) {
        return outerhtml;
    } else {
        return '';
    }
}

function updateFieldsTOCTree(node) {
    tocindex = 1;
    $('#fieldsTOC').remove();
    $('#table-of-contents').append('<div id="fieldsTOC"></div>');
    $('#recordContainer span').each(function () {
        $(this).removeAttr('data-match');
    });
    $('#fieldsTOC').html('<ul>' + traverseTOC($('#recordContainer'), 1) + '</ul>');
    initializeTOC();
}

function initializeTOC() {
    $('#fieldsTOC').jstree({
        "plugins" : [ "themes", "html_data", "types", "ui" ],
        "themes" : { "icons": false },
    });
    $('#fieldsTOC').bind('select_node.jstree', function (e, data) {
        $('#recordContainer span').each(function () { $(this).removeClass('highlight') });
        var obj = data.rslt.obj[0];
        while (typeof(obj) !== 'undefined' && !obj.hasAttribute('data-match')) {
            obj = obj.parentNode;
        }
        if (typeof(obj) !== 'undefined' && obj.hasAttribute('data-match')) {
            $('#recordContainer span[data-match="' + obj.getAttribute('data-match') + '"]').addClass('highlight');
            return false;
        }
    });
    $('#fieldsTOC').bind('deselect_node.jstree', function (e, data) {
        $('#recordContainer span').each(function () { $(this).removeClass('highlight') });
    });
}

function consolidateStyles() {
    $('#recordContainer span').each(function() {
        var node = this;
        var newNode = node;
        for (newNode = node.previousSibling; newNode; newNode = newNode.previousSibling) {
            if (newNode.nodeType === 1 && newNode.nodeName === 'SPAN' && newNode.getAttribute('class') === node.getAttribute('class')) {
                newNode.innerHTML = newNode.innerHTML + node.innerHTML;
                node.parentNode.removeChild(node);
                node = newNode;
            } else {
                break;
            }
        }
        for (newNode = node.nextSibling; newNode; newNode = newNode.nextSibling) {
            if (newNode.nodeType === 1 && newNode.nodeName === 'SPAN' && newNode.getAttribute('class') === node.getAttribute('class')) {
                newNode.innerHTML = node.innerHTML + newNode.innerHTML;
                node.parentNode.removeChild(node);
                node = newNode;
            } else {
                break;
            }
        }
    });
}

function initializeContentEditable() {
    if ($('#editor-toolbar').is(':visible')) {
        $('#recordContainer header,#recordContainer section').each(function() { this.setAttribute('contenteditable', 'true'); });
    } else {
        $('#recordContainer header,#recordContainer section').each(function() { this.setAttribute('contenteditable', 'false'); });
    }
}
