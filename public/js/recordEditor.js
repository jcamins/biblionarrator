var appliers = {};

function initializeRangy() {
    rangy.init();
    for (var key in labeltofieldlookup) {
        appliers[labeltofieldlookup[key]] = rangy.createCssClassApplier(labeltofieldlookup[key], { 'normalize': true });
    }
};

function initializeTinyMCE() {
    var formatlist = {};
    for (var key in labeltofieldlookup) {
        formatlist[labeltofieldlookup[key]] = { 'title' : key, 'inline' : 'span', 'attributes' : { 'class' : labeltofieldlookup[key] } };
    }
    tinyMCE.init({
        mode : "exact",
        elements : "recordContainer",
        theme_advanced_buttons1 : "mynew,reload,mysave,separator,bold,italic,underline,separator,bullist,numlist,separator,pagebreak,separator,tag,closetag,styleselect,pdw_toggle",
        theme_advanced_buttons2 : "formatselect,fontsizeselect,sub,sup,strikethrough,separator,outdent,indent,justifyleft,justifycenter,justifyright",
        theme_advanced_buttons3 : "image,link,unlink,separator,hr,removeformat,separator,undo,redo,separator,charmap",
        pdw_toggle_on : 1,
        pdw_toggle_toolbars : "2,3",
        custom_shortcuts : true,
        plugins : "advimage,autoresize,inlinepopups,pagebreak,pdw",
        style_formats : formatlist,
        formats : formatlist,
        content_css : [ "/css/style.css", "/css/fields.css" ],
        setup : function(ed) {
            ed.addButton('mynew', {
                title : 'New Record',
                class : 'mce_bn_newdocument',
                onclick : confirmNew
            });
            ed.addButton('reload', {
                title : 'Reload Record',
                class : 'mce_bn_reload',
                onclick : confirmReload
            });
            ed.addButton('mysave', {
                title : 'Save Record',
                class : 'mce_bn_save',
                onclick : saveRecord
            });
            ed.addButton('tag', {
                title : 'Add Tag',
                class : 'mce_bn_tag',
                onclick : addTagDialog
            });
            ed.addButton('closetag', {
                title : 'Add Tag',
                class : 'mce_bn_closetag',
                onclick : closeTag
            });
            ed.onNodeChange.add(function(ed, cm, e) {
                if (ed.theme.onResolveName) {
                    ed.theme.onResolveName.add(function(th, o) {
                        updateFieldsTOC(o.node);
                        if (o.name.substring(0, 4) == 'span') {
                            var tag = o.name.replace(/span\./, '');
                            o.name = o.title = fieldtolabellookup[tag];
                            return false;
                        }
                    });
                }
            });
            ed.onKeyDown.add(function(ed, e) {
                if (e.keyCode === 13 || e.keyCode === 32 || e.metaKey || e.ctrlKey || e.altKey) {
                    updateFieldsTOC();
                }
                // There's no good excuse for this, but I'm doing it anyway
                if (e.keyCode === 13 && (tinyMCE.isMac ? e.metaKey : e.ctrlKey)) {
                    saveRecord();
                    return false;
                }
            });
            ed.onClick.add(updateFieldsTOC);
        },
        init_instance_callback : function(inst) {
            inst.addShortcut('ctrl+j', 'add tag', addTagDialog);
            inst.addShortcut('ctrl+k', 'close tag', closeTag);
            inst.addShortcut('ctrl+shift+j', 'close and open tag', closeAndOpenTag);
            inst.addShortcut('ctrl+shift+k', 'close all tags', closeAllTags);
            inst.focus();
        }
    });
}

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
    updateFieldsTOC();
}

function closeTag() {
    var found = false;
    $(rangy.getSelection().getRangeAt(0).commonAncestorContainer).parents('span').each(function () {
        $(this).attr('class').split(' ').reverse().forEach(function (element, index, array) {
            if (typeof fieldtolabellookup[element] !== undefined) {
                appliers[element].undoToSelection();
                found = true;
            }
        });
    });
    updateFieldsTOC();
    return found;
    /*var styles = tinyMCE.get('recordContainer').formatter.matchAll(Object.keys(fieldtolabellookup));

    if (styles[0]) {
        tinyMCE.get('recordContainer').formatter.remove(styles[0]);
        tinyMCE.get('recordContainer').nodeChanged();
        changed = true;
    }
    tinyMCE.execCommand('mceFocus', false, 'recordContainer');
    return (styles.length);*/
}

function newRecord() {
    window.history.pushState({ 'event' : 'new' }, 'New record', '/record');
    tinyMCE.get('recordContainer').setContent('');
}

function loadRecord() {
    var ed = tinyMCE.get('recordContainer');

    ed.setProgressState(1); // Show progress
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
                ed.setContent(text);
                ed.isNotDirty = 1;
                ed.setProgressState(0); // Hide progress
                addAlert('Successfully loaded record', 'success');
            });
        }
    });
}
function ajaxLoadFailed(jqXHR, err, msg) {
    tinyMCE.get('recordContainer').setProgressState(0); // Hide progress
    addAlert('Failed to load record (' + err + ': ' + msg + ')', 'error');
}
function saveRecord() {
    // Do you ajax call here, window.setTimeout fakes ajax call
    //ed.setProgressState(1); // Show progress
    $.ajax({
        type: "GET",
        url: "/xsl/html2raw.xsl",
        dataType: "xml",
        error: ajaxSaveFailed,
    }).done(function(xsl) {
        $.ajax({
            type: "POST",
            url: "/record/" + (typeof(recordId) === 'number' ? recordId : 'new'),
            data: { data: transformXML($('#recordContainer').html().replace('<section[^>]*>', '<section>').replace('<header[^>]*>', '<header>'), xsl) },
            error: ajaxSaveFailed,
        }).done(function(msg) {
            var obj = jQuery.parseJSON(msg);
            recordId = parseInt(obj.id);
            if (typeof(recordId) !== 'undefined') {
                window.history.replaceState({ 'event' : 'save', 'recordId' : recordId }, 'Record ' + recordId, '/record/' + recordId);
            }
            addAlert('Successfully saved record', 'success');
            updateFieldsTOC();
        });
    });
}
function ajaxSaveFailed(jqXHR, err, msg) {
    tinyMCE.get('recordContainer').setProgressState(0); // Hide progress
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
function updateFieldsTOC(node) {
    $('#fieldsTOC').empty();
    var fieldNumber = 1;
    var selector = $('#recordContainer_ifr');
    if (selector.length === 0) {
        selector = $('#recordContainer');
    }
    selector.contents().find('span').each(function() {
        if (typeof($(this).attr('class')) === 'undefined') {
            return;
        }
        var classes = $(this).attr('class').split(' ');
        for (var ii = 0, len = classes.length; ii < len; ++ii) {
            var label = fieldtolabellookup[classes[ii]];
            var value = $(this).text();
            if (typeof(label) !== 'undefined' && value.length > 0) {
                $(this).attr('id', 'tocCorrelate' + fieldNumber);
                var currentNode;
                if (typeof(o) !== 'undefined' && o.node.isSameNode(this)) {
                    currentNode = 1;
                }
                $('#fieldsTOC').append('<div aria-labelledby="labelField' + fieldNumber + '" id="fieldEntry' + fieldNumber + '" class="fieldEntry' + (currentNode ? ' currentEntry' : '') + '"><span id="labelField' + fieldNumber + '" class="toclabel">' + label + '</span><span class="label tocvalue">' + value + '</span></div>');
                fieldNumber++;
            }
        }
    });
    $('.fieldEntry').hover(function() {
        $('#' + $(this).attr('id').replace('fieldEntry', 'tocCorrelate')).addClass('highlight');
        $('#' + $(this).attr('id').replace('fieldEntry', 'tocCorrelate'), $('#recordContainer_ifr').contents()).addClass('highlight');
     }, function() {
        $('#' + $(this).attr('id').replace('fieldEntry', 'tocCorrelate')).removeClass('highlight');
        $('#' + $(this).attr('id').replace('fieldEntry', 'tocCorrelate'), $('#recordContainer_ifr').contents()).removeClass('highlight');
     });
    $('#fieldsTOC.in').css('height', 'auto');
}

var tocindex;

function traverseTOC(node, depth) {
    var notclause = new Array(depth + 2).join(' span');
    var innerhtml = '';
    $(node).find('span').not('#recordContainer' . notclause).each(function () {
        innerhtml += '<li>' + $(this).attr('class');
        innerhtml += traverseTOC(this, depth + 1);
        innerhtml += '</li>';
    });

    if (innerhtml.size > 0) {
        return '<ul>' + innerhtml + '</ul>';
    } else {
        return '';
    }
}

function updateFieldsTOCTree(node) {
    $('#fieldsTOC').html('<ul></ul>');
    var fieldNumber = 1;
    var selector = $('#recordContainer_ifr');
    if (selector.length === 0) {
        selector = $('#recordContainer');
    }
    selector.contents().find('span').each(function() {
        if (typeof($(this).attr('class')) === 'undefined') {
            return;
        }
        var classes = $(this).attr('class').split(' ');
        for (var ii = 0, len = classes.length; ii < len; ++ii) {
            var label = fieldtolabellookup[classes[ii]];
            var value = $(this).text();
            if (typeof(label) !== 'undefined' && value.length > 0) {
                $(this).attr('id', 'tocCorrelate' + fieldNumber);
                var currentNode;
                if (typeof(o) !== 'undefined' && o.node.isSameNode(this)) {
                    currentNode = 1;
                }
                $('#fieldsTOC ul').append('<li aria-labelledby="labelField' + fieldNumber + '" id="fieldEntry' + fieldNumber + '" class="fieldEntry' + (currentNode ? ' currentEntry' : '') + '"><span id="labelField' + fieldNumber + '" class="toclabel">' + label + '</span><span class="label tocvalue">' + value + '</span></li>');
                fieldNumber++;
            }
        }
    });
    $('.fieldEntry').hover(function() {
        $('#' + $(this).attr('id').replace('fieldEntry', 'tocCorrelate')).addClass('highlight');
        $('#' + $(this).attr('id').replace('fieldEntry', 'tocCorrelate'), $('#recordContainer_ifr').contents()).addClass('highlight');
     }, function() {
        $('#' + $(this).attr('id').replace('fieldEntry', 'tocCorrelate')).removeClass('highlight');
        $('#' + $(this).attr('id').replace('fieldEntry', 'tocCorrelate'), $('#recordContainer_ifr').contents()).removeClass('highlight');
     });
    $('#fieldsTOC.in').css('height', 'auto');
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
