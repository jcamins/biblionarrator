function initializeEditor() {
    if (document.URL.indexOf('/new') >= 0 && !$('#toggleEditor').parent().hasClass('active')) {
        $('#toggleEditor').click();
    }
    initializeRangy();
    initializeContentEditable();

    $('.popover-link').popover({
        "html" : true,
        "placement" : "left",
        "container" : "body"
    }).click(function () {
        return false;
    });

    $('.new-record').on('confirmed', newRecord);

    $('#record-reload').on('confirmed', function () {
        loadRecord(recordId);
    });
    
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
        } else if (ev.which == 8) {
            document.getElementById('recordContainer').normalize();
        }
        if (ev.which < 16 || ev.which == 32 || (ev.which > 45 && ev.which < 91) || ev.which > 93) {
            // Anything that is not a movement key or modifier is considered a change
            $('body').addClass('unsaved-changes');
        }
        var sel = rangy.getSelection();
        var span = $(sel.getRangeAt(0).commonAncestorContainer).parents('span').first();
        if ($(span).parents('#recordContainer').size() > 0 && $(sel.getRangeAt(0).commonAncestorContainer).parents('input').size() == 0) {
            var range = rangy.createRange();
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

    $('#upload-image-ok').click(function () {
        $('#upload-image-modal-form').submit();
    });
    $('#upload-image-modal-form').ajaxForm(function () {
        $('#upload-image-modal').modal('hide');
    });

    $('.image-gallery').each(function () {
        var gallery = this;
        $(this).find('.image-gallery-thumbnails').on('click', 'a', null, function () {
            var id = $(this).attr('data-id');
            $(gallery).find('.image-gallery-large').prepend('<a id="delete-image' + id + '" class="delete-image" href="#">&times;</a>');
            $(gallery).find('.delete-image').click(function () {
                $('#confirmLabel').text('Delete image confirmation');
                $('#confirmBody').text('Are you sure you want to delete this image?');
                $('#confirmOK').attr('data-callback', 'delete-image' + id);
                $('#confirm').modal('show');
            });
            $(gallery).find('.delete-image').on('confirmed', function () {
                $.ajax({
                    type: "DELETE",
                    url: "/record/" + recordId + "/image/" + id,
                    dataType: "json",
                }).done(function(msg) {
                    $('li[data-id="' + id + '"]').remove();
                    $('.image-gallery-large').remove();
                });
            });
        });
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

function closeAndOpenTag () {
    closeTag();
    newTag();
}

function closeAllTags () {
    while (closeTag()) {};
}

function setTag(field, sel) {
    if ($(sel.getRangeAt(0).commonAncestorContainer).parents('#recordContainer').size() > 0) {
        for(var ii = 0; ii < sel.rangeCount; ii++) {
            if (typeof appliers[labeltofieldlookup[field]] !== 'undefined') { 
                appliers[labeltofieldlookup[field]].applyToRange(sel.getRangeAt(ii));
            }
        }
        consolidateStyles();
        if (fieldlist[labeltofieldlookup[field]].link) {
            $(sel.getRangeAt(0).startContainer.parentNode).attr('id', 'curlink');
            addLink(fieldlist[labeltofieldlookup[field]]);
        }

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
            if (typeof fieldlist[element] !== 'undefined' && typeof appliers[element] !== 'undefined') {
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
    var savedsel = rangy.saveSelection();
    var tsb = sel.getRangeAt(0).createContextualFragment('<input id="tag-select-box" type="text"></input>');
    sel.getRangeAt(0).insertNode(tsb);
    tsb = document.getElementById('tag-select-box');

    $(tsb).typeahead({
        'name': 'tagselect',
        'local': Object.keys(labeltofieldlookup)
    });

    savedsel = rangy.saveSelection();

    $(tsb).typeaheaddone(savedsel, newTagSelected);
    $(tsb).on('keydown', function (ev) {
        if (ev.which == 27) {
            $(tsb).parent().remove();
            rangy.removeMarkers(savedsel);
            document.getElementById('recordContainer').normalize();
            return false;
        } else if (ev.which == 9) {
            return false;
        }
    });
    $(tsb).focus();
}


function newTagSelected(ev, datum) {
    rangy.restoreSelection(ev.data);
    var sel = rangy.getSelection();
    if (sel.isCollapsed) {
        var elemtype = 'span';
        if (fieldlist[labeltofieldlookup[datum.value]].link) {
            var elemtype = 'a';
        }
        var el = document.createElement(elemtype);
        el.setAttribute('class', labeltofieldlookup[datum.value]);
        el.innerHTML = '&nbsp;';
        $('#tag-select-box').parent().replaceWith(el);
        sel.removeAllRanges();
        var range = rangy.createRange();
        range.selectNodeContents(el);
        sel.addRange(range);
        if (fieldlist[labeltofieldlookup[datum.value]].link) {
            $(el).attr('id', 'curlink');
            addLink(fieldlist[labeltofieldlookup[datum.value]]);
        }
    } else {
        setTag(datum.value, sel);
        $('#tag-select-box').parent().remove();
    }
    $('.rangySelectionBoundary').remove();
}

function newRecord() {
    History.pushState({ 'event' : 'new' }, 'New record', '/record');
    $('#recordContainer').html('<article><header contenteditable="true"></header><section contenteditable="true"></section></article>');
    updateFieldsTOCTree();
}

function loadRecord(id) {
    if (id) {
        $.ajax({
            type: "GET",
            url: "/record/" + id,
            dataType: "json",
        }).done(function(msg) {
            finishedLoading(msg);
            addAlert('Successfully loaded record', 'success');
        }).fail(function(msg) {
            bndb.loadRecord(id, function (res) {
                finishedLoading(JSON.parse(res.data));
                addAlert('Loaded record from local database', 'success');
            });
        });
    }
}

function finishedLoading(data) {
    var text = raw2html(data);
    $('#recordContainer').html(text);
    initializeContentEditable();
}

function ajaxLoadFailed(jqXHR, err, msg) {
    addAlert('Failed to load record (' + err + ': ' + msg + ')', 'error');
}
function saveRecord() {
    $.ajax({
        type: "POST",
        url: "/record/" + (typeof(recordId) === 'number' ? recordId : 'new'),
        dataType: "json",
        data: { data: JSON.stringify(html2raw($('#recordContainer article').get(0))),
                recordtype_id: $('#recordtype-select').val()
              },
        error: ajaxSaveFailed,
    }).done(function(msg) {
        recordId = parseInt(msg.id);
        if (typeof(recordId) !== 'undefined') {
            $('.self-url').each(function () {
                $(this).attr('href', $(this).attr('href').replace(window.location.pathname, '/record/' + recordId));
            });
            History.replaceState({ 'event' : 'save', 'recordId' : recordId }, 'Record ' + recordId, '/record/' + recordId);
        }
        $('body').removeClass('unsaved-changes');
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
        dataType: "json",
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

function addLink(field) {
    $('#link-select').on('hidden', function () {
        $('#curlink').removeAttr('id');
    });
    $('#link-select').load('/record/' + recordId + '/link/select', function () {
        $('#link-select').modal('show');
        $('#link-results').on('click', '.record-view-link', null, function () {
            var link = $(this).parents('tr').first().attr('data-id');
            $('#curlink').attr('href', '/record/' + link);
            if ($('#curlink').text().length <= 1) {
                $('#curlink').text($(this).text());
            }
            $('#link-select').modal('hide');
            return false;
        });
        $('#link-form').submit(function (e) {
            $('#link-results').load('/record/' + recordId + '/link/list/' + field.id + '?q=' + $('#link-q').val());
            return false;
        });
    });
    $('#link-select').on('shown', function () {
        $('#link-q').focus();
    });
}
