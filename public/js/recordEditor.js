
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
        setup : function(ed) {
            ed.addButton('mynew', {
                title : 'New Record',
                class : 'mce_bn_newdocument',
                onclick : newRecord
            });
            ed.addButton('reload', {
                title : 'Reload Record',
                class : 'mce_bn_reload',
                onclick : loadRecord
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
                        if (o.name.substring(0, 4) == 'span') {
                            var tag = o.name.replace(/span\./, '');
                            o.name = o.title = fieldtolabellookup[tag];
                            return false;
                        }
                    });
                }
            });
            ed.onKeyDown.add(function(ed, e) {
                // There's no good excuse for this, but I'm doing it anyway
                if (e.keyCode === 13 && (tinyMCE.isMac ? e.metaKey : e.ctrlKey)) {
                    saveRecord();
                    return false;
                }
            });
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
    $('#tagSelector').modal('show');
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
    tinyMCE.get('recordContainer').formatter.apply(labeltofieldlookup[field]);
    tinyMCE.get('recordContainer').nodeChanged();
    tinyMCE.execCommand('mceFocus', false, 'recordContainer');
}

function closeTag() {
    var styles = tinyMCE.get('recordContainer').formatter.matchAll(fieldtolabellookup.keys);

    if (styles[0]) {
        tinyMCE.get('recordContainer').formatter.remove(styles[0]);
        tinyMCE.get('recordContainer').nodeChanged();
        changed = true;
    }
    tinyMCE.execCommand('mceFocus', false, 'recordContainer');
    return (styles.length);
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
                var text = transformXML(msg, xsl).replace('</?record>','').replace('&#160;', '&nbsp;');
                ed.setContent(text);
                ed.setProgressState(0); // Hide progress
                addAlert('Successfully loaded record');
            });
        }
    });
}
function ajaxLoadFailed(jqXHR, err, msg) {
    tinyMCE.get('recordContainer').setProgressState(0); // Hide progress
    addAlert('Failed to load record (' + err + ': ' + msg + ')');
}
function saveRecord() {
    var ed = tinyMCE.get('recordContainer');

    // Do you ajax call here, window.setTimeout fakes ajax call
    ed.setProgressState(1); // Show progress
    $.ajax({
        type: "GET",
        url: "/xsl/html2raw.xsl",
        dataType: "xml",
        error: ajaxSaveFailed,
    }).done(function(xsl) {
        $.ajax({
            type: "POST",
            url: "/record/" + (typeof(recordId) === 'undefined' ? 'new' : recordId),
            data: { data: transformXML('<record>' + ed.getContent() + '</record>', xsl) },
            error: ajaxSaveFailed,
        }).done(function(msg) {
            var obj = jQuery.parseJSON(msg);
            recordId = parseInt(obj.id);
            if (typeof(recordId) !== 'undefined') {
                window.history.replaceState({ 'event' : 'save', 'recordId' : recordId }, 'Record ' + recordId, '/record/' + recordId);
            }
            ed.setProgressState(0); // Hide progress
            addAlert('Successfully saved record');
        });
    });
}
function ajaxSaveFailed(jqXHR, err, msg) {
    tinyMCE.get('recordContainer').setProgressState(0); // Hide progress
    addAlert('Failed to save record (' + err + ': ' + msg + ')');
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
function addAlert(msg) {
    $('#alerts').append('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>' + msg + '</div>');
    $('#alerts .alert:not(:last-child)').fadeOut(400, function() { $(this).remove() });
}
