@layout('layouts/main')

@section('navigation')
@parent
<li><a class="active" href="/cataloging/editor">Record editor</a></li>
@endsection

@section('content')
<div class="hero-unit">
    <div class="row">
        <div class="span6">
            <h1>Record editor</h1>
            <p>This is the greatest record editor ever!</p>
            
            <form class="well" method="POST" action="record">
            <textarea class="record_editor" name="whatever" cols="50" rows="15"></textarea>
            </form>
            <button id="save" type="button" class="btn btn-primary">Save</button>
            <a id="tagSelectorButton" href="#tagSelector" role="button" class="btn" data-toggle="modal">Select tag</a>
            <a id="removeTag" role="button" class="btn">Remove tag</a>
        </div>
    </div>
    
    
</div>

<!-- Example row of columns -->
<div class="row">
    <div class="span3">
        &nbsp;
    </div>
</div>

<div id="tagSelector" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="tagSelectorLabel" aria-hidden="true">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h3 id="tagSelectorLabel">Select tag</h3>
    </div>
    <div class="modal-body">
        <input type="text" id="tagEntry"></input>
        <select id="tags" size="8">
            @foreach ($fields as $field)
            <option value="{{ $field->schema }}:{{ $field->field }}">{{ $field->field }} ({{ $field->schema }})</option>
            @endforeach
        </select>
    </div>
    <div class="modal-footer">
        <button id="tagSelectorCancel" class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
        <button id="tagSelectorOK" class="btn btn-primary">Select</button>
    </div>
</div>

</div>
<textarea id="saveXSLT" style="display: none;">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:mods="http://www.loc.gov/mods/v3">
    <xsl:template match="span">
        <xsl:element name="{@class}">
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
</textarea>
<textarea id="loadXSLT" style="display: none;">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:mods="http://www.loc.gov/mods/v3" exclude-result-prefixes="mods">
    <xsl:output omit-xml-declaration="yes" />
    <xsl:template match="*" priority="-3">
        <span>
            <xsl:attribute name="class"><xsl:value-of select="name()"/></xsl:attribute>
            <xsl:apply-templates select="./node()"/>
        </span>
    </xsl:template>
    <xsl:template match="record|a|abbr|address|area|article|aside|audio|b|base|bdi|bdo|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|map|mark|menu|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|u|ul|var|video|wbr|text()">
        <xsl:copy>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
</textarea>
@endsection

@section('scripts')
<script type="text/javascript">
tinyMCE.init({
    mode : "specific_textareas",
    editor_selector : "record_editor",
    custom_shortcuts : true,
    plugins : "autoresize",
    formats : {
        @foreach ($fields as $field)
            "{{ $field->schema }}:{{ $field->field }}" : { inline : 'span', attributes : { class: '{{ $field->schema }}:{{ $field->field }}' }, },
        @endforeach
    },
    setup : function(ed) {
        ed.onNodeChange.add(function(ed, cm, e) {
            if (ed.theme.onResolveName) {
                ed.theme.onResolveName.add(function(th, o) {
                    if (o.name.substring(0, 4) == 'span') {
                         o.name = o.name.replace(/span\./, '');
                         o.title = o.title.replace(/class: /, '');
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

</script>
<script type="text/javascript">
var recordId = '{{ $recordId }}';
var fieldlookup = {
    @foreach ($fields as $field)
        '{{ $field->field }} ({{ $field->schema }})': '{{ $field->schema }}:{{ $field->field }}',
    @endforeach
    };
$(document).ready(function() {
    $('#tagEntry').typeahead({
        source: function(query, process) {
            return Object.keys(fieldlookup);
        },
        updater: function(item) {
            setTag(item);
            return item;
        },
    });

    $('#save').click(function() {
        saveRecord();
    });

    $('#removeTag').click(function() {
        closeTag();
    });

    $('#tagSelector').on('shown', function () {
        $('#tagEntry').val('');
        $('#tagEntry').focus();
    });

    $('#tagSelector').on('hidden', function () {
        tinyMCE.execCommand('mceFocus', false, tinyMCE.activeEditor.id);
    });

    $('#tagEntry').keydown(function(ev) {
        if (ev.keyCode == 13) {
            var field = $('#tagEntry').val();
            if (fieldlookup[field]) {
                setTag(field);
            }
        }
    });

    $(document).bind('keydown', 'ctrl-j', addTagDialog);
    $(document).bind('keydown', 'ctrl-k', closeTag);
    $(document).bind('keydown', 'ctrl-shift-j', closeAndOpenTag);
    $(document).bind('keydown', 'ctrl-shift-k', closeAllTags);
    $(document).bind('keydown', 'ctrl-return', saveRecord);
});

$(window).load(function() {
    loadRecord();
});

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
    var styles = tinyMCE.activeEditor.formatter.matchAll([
        @foreach ($fields as $field)
            "{{ $field->schema }}:{{ $field->field }}",
        @endforeach
    ]);

    if (styles[0]) {
        tinyMCE.activeEditor.formatter.remove(styles[0]);
        tinyMCE.activeEditor.nodeChanged();
        changed = true;
    }
    tinyMCE.execCommand('mceFocus', false, tinyMCE.activeEditor.id);
    return (styles.length);
}

function loadRecord() {
    var ed = tinyMCE.get('whatever');

    if (recordId) {
        ed.setProgressState(1); // Show progress
        $.ajax({
            type: "GET",
            url: "/svc/record",
            data: { id: recordId }
        }).done(function(msg) {
            var obj = jQuery.parseJSON(msg);
            ed.setProgressState(0); // Hide progress
            var text = transformXML(obj.data, $('#loadXSLT').val()).replace('</?record>','').replace('&#160;', '&nbsp;');
            ed.setContent(text);
        });
    }
}
function saveRecord() {
    var ed = tinyMCE.get('whatever');

    // Do you ajax call here, window.setTimeout fakes ajax call
    ed.setProgressState(1); // Show progress
    $.ajax({
        type: "POST",
        url: "/svc/record",
        data: { id: recordId, data: transformXML('<record>' + ed.getContent().replace('&nbsp;', '&#160;') + '</record>', $('#saveXSLT').val()) }
    }).done(function(msg) {
        var obj = jQuery.parseJSON(msg);
        recordId = obj.id;
        ed.setProgressState(0); // Hide progress
    });
}
function transformXML(xml, xsl) {
    var result;
    if (!xml) {
        return "";
    }
    if (window.ActiveXObject) {
        result = new ActiveXObject("MSXML2.DOMDocument");
        xml.transformNodeToObject(xsl, result);
    } else {    // Other browsers
        var parser = new DOMParser();
        result = new XSLTProcessor();
        result.importStylesheet(parser.parseFromString(xsl, "text/xml"));
        result = result.transformToFragment(parser.parseFromString(xml, "text/xml"), document);
    }
    return (new XMLSerializer()).serializeToString(result);
}
</script>
@endsection
