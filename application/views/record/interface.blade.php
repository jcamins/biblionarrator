@layout('layouts/main')

@section('navigation')
@parent
@endsection

@section('controlbar')
    <li><a href="#" id="toggleTOC" data-target="#table-of-contents" data-toggle="cookie-view" data-cookie="show_toc">TOC</a></li>
    @if ($editor)
        <li><a href="#" id="toggleEditor" data-target="#editor-toolbar" data-toggle="cookie-view" data-cookie="show_editor">Editor</a></li>
    @endif
    <li class="active"><a href="#" id="toggleLinks" data-target="#linksPane" data-toggle="cookie-view" data-cookie="show_links">Links</a></li>
@if ($editor)
    <li class="divider-vertical"></li>
    </ul>
    <ul id="editor-toolbar" class="nav">
        <li><a href="#" id="new" data-toggle="modal" data-target="#confirmNew" class="caret-before">New</a></li>
        <li class="dropdown">
            <a href="#" id="dropdown-new" data-toggle="dropdown" class="caret-after dropdown-toggle"><b class="caret"></b></a>
            <ul class="dropdown-menu">
                <li><a data-toggle="modal" data-target="#confirmNew">Blank record</a></li>
                <li><a id="new-related">Related record</a></li>
                <li><a id="duplicate">Duplicate record</a></li>
            </ul>
        </li>
        <li><a id="save">Save</a></li>
        <li><a href="{{ URL::full() }}" id="reload" data-toggle="modal" data-target="#confirmReload">Reload</a></li>
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
        @include('components.linkpane')
    </div>
@endsection

@section('form_modals')
@parent
@if ($editor)
<div id="tagSelector" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="tagSelectorLabel" aria-hidden="true">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h3 id="tagSelectorLabel">Select tag</h3>
    </div>
    <div class="modal-body">
        <input type="text" id="tagEntry"></input>
        <select id="tags" size="8">
            @foreach (Field::all() as $field)
            <option value="{{ $field->schema }}:{{ $field->field }}">{{ $field->label }}</option>
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
<div id="link-select" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="link-select-label" aria-hidden="true">
</div>
@endif
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
        '{{ $field->label }}': '{{ $field->schema }}_{{ $field->field }}',
    @endforeach
    };
var fieldlist = {
    @foreach (Field::all() as $field)
        '{{ $field->schema }}_{{ $field->field }}': {
            'label': '{{ $field->label }}',
            'link': {{ $field->link ? 'true' : 'false' }}
        },
    @endforeach
    };
var currentSelection;
$(document).ready(function() {
    @if ($editor)
        initializeEditor();
    @endif

    $('#table-of-contents').on('show hide click', function() {
        $(this).css('height', 'auto');
    });

    $('#recordContainer').on('mouseenter', 'span, a', null, function() {
        var fieldentry = $('#fieldsTOC .fieldEntry[data-match="' + $(this).attr('data-match') + '"]');
        $('#fieldsTOC').jstree('open_node', fieldentry);
        $('#fieldsTOC').jstree('select_node', fieldentry);
        return false;
     }).on('mouseleave', 'span, a', null, function() {
        $('#fieldsTOC').jstree('deselect_node', $('#fieldsTOC .fieldEntry[data-match="' + $(this).attr('data-match') + '"]'));
        return false;
     });

    updateFieldsTOCTree();
});

$(window).load(function() {
    shortcut.add('Ctrl+J', addTagDialog);
    shortcut.add('Ctrl+K', closeTag);
    shortcut.add('Ctrl+Shift+J', closeAndOpenTag);
    shortcut.add('Ctrl+Shift+K', closeAllTags);
    shortcut.add('Ctrl+Return', saveRecord);
});

</script>
@endsection
