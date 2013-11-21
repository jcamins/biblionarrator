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
        ev.preventDefault();
    });

    $('.new-record').on('confirmed', newRecord);

    $('#record-reload').on('confirmed', function () {
        loadRecord(document.record.id);
    });
    
    $('#record-delete').on('confirmed', function () {
        window.location = $(this).attr('href');
    });

    $('.save-record').click(saveRecord);

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
        ev.preventDefault();
    });

    $('#recordtype-select').change(function () {
        $('body').addClass('unsaved-changes');
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
        if ((ev.which < 16 && ev.which != 9) || ev.which == 32 || (ev.which > 45 && ev.which < 91) || ev.which > 93) {
            // Anything that is not a movement key or modifier is considered a change
            $('body').addClass('unsaved-changes');
        }
        var sel = rangy.getSelection();
        var span = $(sel.getRangeAt(0).commonAncestorContainer).parents('span').first();
        if ($(span).parents('#recordContainer').size() > 0 && $(sel.getRangeAt(0).commonAncestorContainer).parents('input').size() === 0) {
            var range = rangy.createRange();
            if (ev.which == 9 && ev.shiftKey && $(span).prevAll('span') > 0) {
                sel.removeAllRanges();
                sel.selectAllChildren($(span).prevAll('span').first()[0]);
                ev.preventDefault();
            } else if (ev.which == 9 && $(span).nextAll('span').size() > 0) {
                sel.removeAllRanges();
                sel.selectAllChildren($(span).nextAll('span').first()[0]);
                ev.preventDefault();
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

    $('#upload-image-modal').on('hidden', function () {
        $('#image-image').replaceWith('<input type="file" placeholder="Choose an image to upload" name="media" id="image-image" />');
    });

    $('.image-gallery').each(function () {
        var gallery = this;
        $(this).find('.image-gallery-thumbnails').on('click', 'a', null, function () {
            var filename = $(this).attr('data-id');
            var id = filename.replace('.', '_');
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
                    url: "/record/" + document.record.id + "/media/" + filename,
                    dataType: "json"
                }).done(function(msg) {
                    $('li[data-id="' + filename + '"]').remove();
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
}

function closeAndOpenTag () {
    closeTag();
    newTag();
}

function closeAllTags () {
    while (closeTag()) {}
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
        $(this).attr('class').split(' ').reverse().forEach(function (element) {
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
            ev.preventDefault();
        } else if (ev.which == 9) {
            ev.preventDefault();
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
            elemtype = 'a';
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
            dataType: "json"
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
    document.record = new Record(data);
    $('#recordContainer').html(document.record.render());
    initializeContentEditable();
}

function ajaxLoadFailed(jqXHR, err, msg) {
    addAlert('Failed to load record (' + err + ': ' + msg + ')', 'error');
}
function saveRecord() {
    $.ajax({
        type: "POST",
        url: "/record/" + (typeof document.record.id !== 'undefined' ? encodeURIComponent(document.record.id) : 'new'),
        dataType: "json",
        data: { data: JSON.stringify(window.formatters[document.record.format].decompile($('#recordContainer article').get(0))),
                recordtype_id: $('#recordtype-select').val(),
                key: document.getElementById('record-key').value
              },
        error: ajaxSaveFailed
    }).done(function(msg) {
        document.record.id = msg.id;
        if (typeof(document.record.id) !== 'undefined') {
            $('.self-url').each(function () {
                $(this).attr('href', $(this).attr('href').replace(window.location.pathname, '/record/' + encodeURIComponent(document.record.id)));
            });
            History.replaceState({ 'event' : 'save', 'recordId' : document.record.id }, 'Record ' + document.record.id, '/record/' + encodeURIComponent(document.record.id));
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
        data: { data: JSON.stringify(window.formatters[document.record.format].decompile($('#recordContainer article').get(0))),
                recordtype: $('#recordtype-select').val(),
                name: $('#template-name').val()
              },
        error: ajaxTemplateSaveFailed
    }).done(function(msg) {
        document.record.id = msg.id;
        addAlert('Successfully saved template', 'success');
        updateFieldsTOCTree();
    });
}
function addAlert(msg, type) {
    $('#alerts').append('<div class="alert alert-' + type + '"><button type="button" class="close" data-dismiss="alert">&times;</button>' + msg + '</div>');
    $('#alerts .alert:not(:last-child)').fadeOut(400, function() { $(this).remove(); });
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
        $('#recordContainer header,#recordContainer section').each(function() {
            var editor = this;
            this.setAttribute('contenteditable', 'true');
            this.onkeydown = function (ev) {
                if (ev.keyCode === 50) {
                    ev.preventDefault();
                    var sel = rangy.getSelection();
                    var savedsel = rangy.saveSelection();
                    var acid = 'editor-autocomplete-' + Math.floor((Math.random() * 10000) + 1);
                    var autocomplete = sel.getRangeAt(0).createContextualFragment('<span id="' + acid + '" style="display: inline-block;"></span>');
                    sel.getRangeAt(0).insertNode(autocomplete);
                    autocomplete = document.getElementById(acid);
                    var c = new Completely(autocomplete, {
                        format: models.Record.render,
                        hint: function (opt, token) {
                            return opt.key;
                        },
                        match: function (opt, token) {
                            return opt.key.toLowerCase().indexOf(token.toLowerCase()) === 0;
                        },
                        tokenentry: function (input) {
                            var self = this;
                            if (input === '@') {
                                self.completed('@');
                            } else {
                                $.ajax({
                                    type: "GET",
                                    url: '/cataloging/suggest?q=' + input,
                                    dataType: 'json'
                                }).done(function(data) {
                                    self.options = data.records;
                                    self.update();
                                });
                            }
                        },
                        completed: function (opt) {
                            $('#' + acid).replaceWith(opt.key);
                            editor.focus();
                            rangy.restoreSelection(savedsel);
                        },
                        canceled: function () {
                            autocomplete.parentNode.removeChild(autocomplete);
                            editor.focus();
                            rangy.restoreSelection(savedsel);
                        }
                    });
                }
            };
        });
    } else {
        $('#add-section').hide();
        $('#recordContainer header,#recordContainer section').each(function() { this.setAttribute('contenteditable', 'false'); });
    }
}

function addLink(field) {
    $('#link-select').on('hidden', function () {
        $('#curlink').removeAttr('id');
    });
    $('#link-select').load('/record/' + document.record.id + '/link/select', function () {
        $('#link-select').modal('show');
        $('#link-results').on('click', '.record-view-link', null, function () {
            var link = $(this).parents('tr').first().attr('data-id');
            $('#curlink').attr('href', '/record/' + link);
            if ($('#curlink').text().length <= 1) {
                $('#curlink').text($(this).text());
            }
            $('#link-select').modal('hide');
            ev.preventDefault();
        });
        $('#link-form').submit(function (e) {
            $('#link-results').load('/record/' + document.record.id + '/link/list/' + field.id + '?q=' + $('#link-q').val());
            ev.preventDefault();
        });
    });
    $('#link-select').on('shown', function () {
        $('#link-q').focus();
    });
}
