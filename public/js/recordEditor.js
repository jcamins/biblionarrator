function initializeEditor() {
    initializeRangy();
    initializeContentEditable();
    $('#tagEntry').typeahead({
        'name': 'tagselect',
        'local': Object.keys(labeltofieldlookup)
    });

    $('#tagEntry').on('typeahead:autocompleted', function (ev, datum) {
        setTag(datum.value);
    });
    $('#tagEntry').on('typeahead:selected', function (ev, datum) {
        setTag(datum.value);
    });

    $('.popover-link').popover({
        "html" : true,
        "placement" : "left",
        "container" : "body"
    }).click(function () {
        return false;
    });

    $('#confirmNewOK').click(confirmNew);

    $('#confirmReloadOK').click(confirmReload);

    $('#save').click(saveRecord);

    $('#removeTag').click(closeTag);

    $('#tagSelector').on('shown', function () {
        $('#tagEntry').val('');
        $('#tagEntry').focus();
    });

    $('#tagSelector').on('hidden', function () {
 //       tinyMCE.execCommand('mceFocus', false, 'recordContainer');
    });

    $('#tagEntry').keydown(function(ev) {
        if (ev.keyCode == 13) {
            var field = $('#tagEntry').val();
            if (labeltofieldlookup[field]) {
                setTag(field);
            }
        }
    });

    $('#editor-toolbar').on('cookietoggle', null, null, initializeContentEditable);

    $('#add-section').click(function() {
        var newsection = document.createElement('section');
        $('#recordContainer article').append(newsection);
        $(newsection).attr('contenteditable', 'true');
        $(newsection).focus();
    });

    $('#tag').click(function () {
        addTagDialog();
        return false;
    });
    $('#untag').click(function () {
        closeTag();
        return false;
    });
}

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
    if (rangy.getSelection().getRangeAt(0).collapsed) {
        var el = document.createTextNode(' ');
        var sel = rangy.getSelection();
        sel.getRangeAt(0).insertNode(el);
        var range = document.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
        rangy.getSelection().refresh();
    }

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
    //consolidateStyles();
    if ($(currentSelection.getRangeAt(0).startContainer.parentNode).prop('tagName') === 'A') {
        $(currentSelection.getRangeAt(0).startContainer.parentNode).attr('id', 'curlink');
        addLink();
    }

    //$(currentSelection.getRangeAt(0).commonAncestorContainer.parentNode).focus();

    updateFieldsTOCTree();
}

function closeTag() {
    var found = false;
    $(rangy.getSelection().getRangeAt(0).commonAncestorContainer).parents('span, a').each(function () {
        $(this).attr('class').split(' ').reverse().forEach(function (element, index, array) {
            if (found) {
                return;
            }
            if (typeof fieldlist[element] !== undefined && typeof appliers[element] !== undefined) {
                appliers[element].undoToSelection();
                found = true;
            }
        });
    });
    updateFieldsTOCTree();
    return found;
}

function newRecord() {
    History.pushState({ 'event' : 'new' }, 'New record', '/record');
    $('#recordContainer').html('<article><header contenteditable="true"></header><section contenteditable="true"></section></article>');
    updateFieldsTOCTree();
}

function loadRecord() {
    if (recordId) {
        $.ajax({
            type: "GET",
            url: "/record/" + recordId + '/json',
            dataType: "json",
            error: ajaxLoadFailed,
        }).done(function(msg) {
            var text = raw2html(msg);
            $('#recordContainer').html(text);
            initializeContentEditable();
            addAlert('Successfully loaded record', 'success');
        });
    }
}
function ajaxLoadFailed(jqXHR, err, msg) {
    addAlert('Failed to load record (' + err + ': ' + msg + ')', 'error');
}
function saveRecord() {
    $.ajax({
        type: "POST",
        url: "/record/" + (typeof(recordId) === 'number' ? recordId : 'new'),
        data: { data: JSON.stringify(html2raw($('#recordContainer article').get(0))) },
        error: ajaxSaveFailed,
    }).done(function(msg) {
        recordId = parseInt(msg.id);
        if (typeof(recordId) !== 'undefined') {
            History.replaceState({ 'event' : 'save', 'recordId' : recordId }, 'Record ' + recordId, '/record/' + recordId);
        }
        addAlert('Successfully saved record', 'success');
        updateFieldsTOCTree();
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

function consolidateStyles() {
    $('#recordContainer span, #recordContainer a').each(function() {
        var node = this;
        var newNode = node;
        for (newNode = node.previousSibling; newNode; newNode = newNode.previousSibling) {
            if (newNode.nodeType === 1 && (newNode.nodeName === 'SPAN' || newNode.nodeName === 'A') && newNode.getAttribute('class') === node.getAttribute('class')) {
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
        $('#add-section').show();
        $('#recordContainer header,#recordContainer section').each(function() { this.setAttribute('contenteditable', 'true'); });
    } else {
        $('#add-section').hide();
        $('#recordContainer header,#recordContainer section').each(function() { this.setAttribute('contenteditable', 'false'); });
    }
}

function addLink() {
    $('#link-select').on('hidden', function () {
        $('#curlink').removeAttr('id');
    });
    $('#link-select').load('/record/' + recordId + '/link/select', function () {
        $('#link-results').on('click', '.record-view-link', null, function () {
            var link = $(this).parents('tr').first().attr('data-id');
            $('#curlink').attr('href', '/record/' + link);
            $('#link-select').modal('hide');
            return false;
        });
        $('#link-form').submit(function (e) {
            $('#link-results').load('/record/' + recordId + '/link/list?q=' + $('#link-q').val());
            return false;
        });
    });
    $('#link-select').modal('show');
}
