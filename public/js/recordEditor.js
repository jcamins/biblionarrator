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

    $('.new-record').on('confirmed', newRecord);

    $('#record-reload').on('confirmed', loadRecord);
    
    $('#record-delete').on('confirmed', function () {
        window.location = $(this).attr('href');
    });

    $('#save').click(saveRecord);

    $('#removeTag').click(closeTag);

    $('#editor-toolbar').on('cookietoggle', null, null, initializeContentEditable);

    $('#add-section').click(function() {
        var newsection = document.createElement('section');
        $('#recordContainer article').append(newsection);
        $(newsection).attr('contenteditable', 'true');
        $(newsection).focus();
    });

    $('#tag-select .dropdown-menu a').click(function () {
        setTag($(this).text(), rangy.getSelection());
    });
    $('#untag').click(function () {
        closeTag();
        return false;
    });

    $('#template-name').keydown(function (ev) {
        if (ev.keyCode == 13) {
            $('#save-template-ok').click();
        }
    });

    $('#save-template-ok').click(saveTemplate);

    $('#recordContainer').keydown(function (ev) {
        if (ev.which == 13 || ev.which == 32) {
            updateFieldsTOCTree();
        }
    });

    $('#recordContainer').keydown(function (ev) {
        var sel = rangy.getSelection();
        var range = rangy.createRange();
        var span = $(sel.getRangeAt(0).commonAncestorContainer).parents('span').first();
        if ($(span).parents('#recordContainer').size() > 0) {
            if (ev.which == 9 && ev.shiftKey && $(span).prevAll('span') > 0) {
                sel.removeAllRanges();
                sel.selectAllChildren($(span).prevAll('span').first()[0]);
                return false;
            } else if (ev.which == 9 && $(span).nextAll('span').size() > 0) {
                sel.removeAllRanges();
                sel.selectAllChildren($(span).nextAll('span').first()[0]);
                return false;
            }
        }
    });

    $('#recordContainer').focusout(updateFieldsTOCTree);
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

function closeAndOpenTag () {
    closeTag();
    newTag();
}

function closeAllTags () {
    while (closeTag()) {};
}

function setTag(field, sel) {
    if ($(sel.getRangeAt(0).commonAncestorContainer).parents('#recordContainer').size > 0) {
        for(var ii = 0; ii < sel.rangeCount; ii++) {
            if (typeof appliers[labeltofieldlookup[field]] !== 'undefined') { 
                appliers[labeltofieldlookup[field]].applyToRange(sel.getRangeAt(ii));
            }
        }
        consolidateStyles();
        if ($(sel.getRangeAt(0).startContainer.parentNode).prop('tagName') === 'A') {
            $(sel.getRangeAt(0).startContainer.parentNode).attr('id', 'curlink');
            addLink();
        }

        //$(sel.getRangeAt(0).commonAncestorContainer.parentNode).focus();

        updateFieldsTOCTree();
    }
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

function newTag() {
    var sel = rangy.getSelection();
    var sellen;
    if (!sel.isCollapsed) {
        sellen = sel.getRangeAt(0).endOffset - sel.getRangeAt(0).startOffset;
    }
    var tsb = sel.getRangeAt(0).createContextualFragment('<input id="tag-select-box" type="text"></input>');
    sel.getRangeAt(0).insertNode(tsb);
    tsb = document.getElementById('tag-select-box');
    if (sellen) {
        var range = rangy.createRange();
        range.setStart(tsb.nextSibling, 0);
        range.setEnd(tsb.nextSibling, sellen);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    $(tsb).typeahead({
        'name': 'tagselect',
        'local': Object.keys(labeltofieldlookup)
    });

    $(tsb).on('typeahead:autocompleted', null, sel, newTagSelected);
    $(tsb).on('typeahead:selected', null, sel, newTagSelected);
    $(tsb).on('keydown', function (ev) {
        if (ev.keyCode == 13) {
            var e2 = {};
            e2['data'] = sel;
            var datum = {};
            datum['value'] = $(tsb).val();
            newTagSelected(e2, datum);
        } else if (ev.keyCode == 27) {
            $(tsb).parent().remove();
        }
    });
    $(tsb).focus();
}


function newTagSelected(ev, datum) {
    if (ev.data.isCollapsed) {
        var el = document.createElement('span');
        el.setAttribute('class', labeltofieldlookup[datum.value]);
        el.innerHTML = '&nbsp;';
        $('#tag-select-box').parent().replaceWith(el);
        var sel = rangy.getSelection();
        sel.removeAllRanges();
        var range = rangy.createRange();
        range.selectNodeContents(el);
        sel.addRange(range);
    } else {
        $('#tag-select-box').parent().remove();
        setTag(datum.value, ev.data);
    }
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
        data: { data: JSON.stringify(html2raw($('#recordContainer article').get(0))),
                recordtype: $('#recordtype-select').val()
              },
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
function ajaxTemplateSaveFailed(jqXHR, err, msg) {
    addAlert('Failed to save template (' + err + ': ' + msg + ')', 'alert');
}
function saveTemplate() {
    $.ajax({
        type: "POST",
        url: "/resources/template/",
        data: { data: JSON.stringify(html2raw($('#recordContainer article').get(0))),
                recordtype: $('#recordtype-select').val(),
                name: $('#template-name').val()
              },
        error: ajaxTemplateSaveFailed,
    }).done(function(msg) {
        recordId = parseInt(msg.id);
        addAlert('Successfully saved template', 'success');
        updateFieldsTOCTree();
    });
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
