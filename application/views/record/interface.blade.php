@layout('layouts/main')

@section('navigation')
@parent
@endsection

@section('sidetoolbar')
@if ($editor)
    <div class="btn-toolbar">
    <div class="btn-group" data-toggle="buttons-checkbox">
    <button id="toggleTOC" type="button" class="btn btn-info btn-small">TOC</button>
    <button id="toggleEditor" type="button" class="btn btn-info btn-small">Editor</button>
    <button id="toggleLinks" type="button" class="btn btn-info btn-small active">Links</button>
    </div>
    </div>
@endif
@endsection

@section('toolbar')
@if ($editor)
    <div class="btn-toolbar">
        <div class="btn-group">
            <button id="new" type="button" data-toggle="modal" data-target="#confirmNew" class="btn btn-small">New</button>
            <button id="reload" type="button" data-toggle="modal" data-target="#confirmReload" class="btn btn-small">Reload</button>
            <button id="save" type="button" class="btn btn-small">Save</button>
        </div>
    </div>
@endif
@endsection

@section('sidebar')
    <div id="sidebarAffix">
        <div id="table-of-contents">
            <div id="toc-header">
                Table of Contents
            </div>
            <div id="fieldsTOC">
            </div>
        </div>
    </div>
@endsection

@section('content')
    <div class="row-fluid">
        <div class="span6">
            @if ($editor)
            <noscript>
            <div class="alert alert-error">
                <button type="button" class="close" data-dismiss="alert">&times;</button>
                The record editor does not work without Javascript. Please enable Javascript and reload the page.
            </div>
            </noscript>
            @endif
            <div itemscope id="recordContainer" class="recordtype_{{ $recordtype }}">
                @if ($record->format('html'))
                    {{ $record->format('html') }}
                @else
                    <article>
                        <header></header>
                        <section></section>
                    </article>
                @endif
            </div>
            @if ($editor)
            <div><button id="add-section" class="btn btn-link">Add section</button></div>
            @endif
            <div id="alerts"></div>
        </div>
        <div id="linksPane" class="span4">
            <div id="linkaccordion" class="accordion">
            @foreach ($record->targets as $link)
                @include('record.linkview')
            @endforeach
            </div>
        </div>
    </div>
@endsection

@section('form_modals')
@parent
<div id="tagSelector" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="tagSelectorLabel" aria-hidden="true">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h3 id="tagSelectorLabel">Select tag</h3>
    </div>
    <div class="modal-body">
        <input type="text" id="tagEntry"></input>
        <select id="tags" size="8">
            @foreach (Field::all() as $field)
            <option value="{{ $field->schema }}:{{ $field->field }}">{{ $field->field }} ({{ $field->schema }})</option>
            @endforeach
        </select>
    </div>
    <div class="modal-footer">
        <button id="tagSelectorCancel" class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
        <button id="tagSelectorOK" class="btn btn-primary">Select</button>
    </div>
</div>
<div id="confirmNew" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="confirmNewLabel" aria-hidden="true">
    <div class="modal-header">
        <h3 id="confirmNewLabel">New record confirmation</h3>
    </div>
    <div class="modal-body">
        If you create a new record, any unsaved changes will be lost. Are you sure you want to create a new record?
    </div>
    <div class="modal-footer">
        <button id="confirmNewCancel" class="btn" data-dismiss="modal" aria-hidden="true">No</button>
        <button id="confirmNewOK" class="btn btn-primary">Yes</button>
    </div>
</div>
<div id="confirmReload" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="confirmReloadLabel" aria-hidden="true">
    <div class="modal-header">
        <h3 id="confirmReloadLabel">Record reload confirmation</h3>
    </div>
    <div class="modal-body">
        If you reload this record from the database, any unsaved changes will be lost. Are you sure you want to reload the record?
    </div>
    <div class="modal-footer">
        <button id="confirmReloadCancel" class="btn" data-dismiss="modal" aria-hidden="true">No</button>
        <button id="confirmReloadOK" class="btn btn-primary">Yes</button>
    </div>
</div>
@endsection

@section('scripts')
<script type="text/javascript">
@if (isset($record->id))
var recordId = {{ $record->id }};
@else
var recordId;
@endif

var labeltofieldlookup = {
    @foreach (Field::all() as $field)
        '{{ $field->field }} ({{ $field->schema }})': '{{ $field->schema }}_{{ $field->field }}',
    @endforeach
    };
var fieldlist = {
    @foreach (Field::all() as $field)
        '{{ $field->schema }}_{{ $field->field }}': {
            'label': '{{ $field->field }} ({{ $field->schema }})',
            'link': {{ $field->link ? 'true' : 'false' }}
        },
    @endforeach
    };
@if ($editor)
var currentSelection;
$(document).ready(function() {
    initializeRangy();
    $('#tagEntry').typeahead({
        source: function(query, process) {
            return Object.keys(labeltofieldlookup);
        },
        updater: function(item) {
            setTag(item);
            return item;
        },
    });

    $('.popover-link').popover({
        "html" : true,
        "placement" : "left",
        "container" : "body"
    }).click(function () {
        return false;
    });

    updateFieldsTOCTree();

    $('#table-of-contents').on('show hide click', function() {
        $(this).css('height', 'auto');
    });

    $('#toggleTOC').click(function() {
        if ($('#table-of-contents').is(':visible')) {
            $('#table-of-contents').hide();
            jQuery.cookie('show_toc', 0);
        } else {
            $('#table-of-contents').show();
            jQuery.cookie('show_toc', 1);
        }
    });

    $('#toggleEditor').click(function() {
        if ($(this).hasClass('active')) {
            $('#recordContainer header,#recordContainer section').each(function() { this.setAttribute('contenteditable', 'false'); });
            jQuery.cookie('show_editor', 0);
        } else {
            $('#recordContainer header,#recordContainer section').each(function() { this.setAttribute('contenteditable', 'true'); });
            jQuery.cookie('show_editor', 1);
        }
    });

    $('#toggleLinks').click(function() {
        if ($('#linksPane').is(':visible')) {
            $('#linksPane').hide();
            jQuery.cookie('show_links', 0);
        } else {
            $('#linksPane').show();
            jQuery.cookie('show_links', 1);
        }
    });

    $('#confirmNewOK').click(function() {
        confirmNew();
    });

    $('#confirmReloadOK').click(function() {
        confirmReload();
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

    if ( jQuery.cookie('show_editor') == 1 ) {
        $('#recordContainer header,#recordContainer section').each(function() { this.setAttribute('contenteditable', 'true'); });
        $('#toggleEditor').addClass('active');
    }

    if ( jQuery.cookie('show_toc') == 1 ) {
        $('#table-of-contents').show();
        $('#toggleTOC').addClass('active');
    }

    if ( jQuery.cookie('show_links') == 0 ) {
        $('#linksPane').hide();
        $('#toggleLinks').removeClass('active');
    }

    $('#recordContainer').on('mouseenter', 'span', null, function() {
        var fieldentry = $('#fieldsTOC .fieldEntry[data-match="' + $(this).attr('data-match') + '"]');
        //$('#fieldsTOC').jstree('save_opened');
        $('#fieldsTOC').jstree('open_node', fieldentry);
        $('#fieldsTOC').jstree('select_node', fieldentry);
        return false;
     });
    $('#recordContainer').on('mouseleave', 'span', null, function() {
        $('#fieldsTOC').jstree('deselect_node', $('#fieldsTOC .fieldEntry[data-match="' + $(this).attr('data-match') + '"]'));
        //$('#fieldsTOC').jstree('close_all');
        //$('#fieldsTOC').jstree('reopen');
        return false;
     });

    $("#recordContainer a").click(function(e){
        e.stopPropagation();
    });

    $('#add-section').click(function() {
        var newsection = document.createElement('section');
        $('#recordContainer article').append(newsection);
        if ($('#toggleEditor').hasClass('active')) {
            newsection.addAttribute('contenteditable', 'true');
        }
        $(newsection).click();
    });
});
@endif

$(window).load(function() {
    shortcut.add('Ctrl+J', addTagDialog);
    shortcut.add('Ctrl+K', closeTag);
    shortcut.add('Ctrl+Shift+J', closeAndOpenTag);
    shortcut.add('Ctrl+Shift+K', closeAllTags);
    shortcut.add('Ctrl+Return', saveRecord);
});

</script>
@endsection
