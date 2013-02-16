
function initializeTinyMCE() {
    var formatlist = {};
    for (var key in fieldlookup) {
        formatlist[key] = { 'inline' : 'span', 'attributes' : { 'class' : key } };
    }
    tinyMCE.init({
        mode : "exact",
        elements : "recordContainer",
        custom_shortcuts : true,
        plugins : "autoresize",
        formats : formatlist,
        setup : function(ed) {
            ed.onNodeChange.add(function(ed, cm, e) {
                if (ed.theme.onResolveName) {
                    ed.theme.onResolveName.add(function(th, o) {
                        if (o.name.substring(0, 4) == 'span') {
                             o.name = o.name.replace(/span\./, '');
                             o.title = fieldlist[o.name];
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
            inst.addShortcut("ctrl+shift+k", 'close all tags', closeAllTags);
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
    tinyMCE.activeEditor.formatter.apply(fieldlookup[field]);
    tinyMCE.activeEditor.nodeChanged();
    tinyMCE.execCommand('mceFocus', false, tinyMCE.activeEditor.id);
}

function closeTag() {
    var styles = tinyMCE.get('recordContainer').formatter.matchAll(fieldlookup.keys);

    if (styles[0]) {
        tinyMCE.activeEditor.formatter.remove(styles[0]);
        tinyMCE.activeEditor.nodeChanged();
        changed = true;
    }
    tinyMCE.execCommand('mceFocus', false, tinyMCE.activeEditor.id);
    return (styles.length);
}

function loadRecord() {
    var ed = tinyMCE.get('recordContainer');

    $.ajax({
        type: "GET",
        url: "/xsl/raw2html.xsl",
        dataType: "xml",
    }).done(function(xsl) {
        if (recordId) {
            ed.setProgressState(1); // Show progress
            $.ajax({
                type: "GET",
                url: "/record/" + recordId + '/raw',
                dataType: "xml",
            }).done(function(msg) {
                var text = transformXML(msg, xsl).replace('</?record>','').replace('&#160;', '&nbsp;');
                ed.setContent(text);
                ed.setProgressState(0); // Hide progress
            });
        }
    });
}
function saveRecord() {
    var ed = tinyMCE.get('recordContainer');

    // Do you ajax call here, window.setTimeout fakes ajax call
    ed.setProgressState(1); // Show progress
    $.ajax({
        type: "GET",
        url: "/xsl/html2raw.xsl",
        dataType: "xml",
    }).done(function(xsl) {
        $.ajax({
            type: "POST",
            url: "/record/" + recordId,
            data: { data: transformXML('<record>' + ed.getContent().replace('&nbsp;', '&#160;') + '</record>', $('#saveXSLT').val()) }
        }).done(function(msg) {
            var obj = jQuery.parseJSON(msg);
            recordId = obj.id;
            ed.setProgressState(0); // Hide progress
        });
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
