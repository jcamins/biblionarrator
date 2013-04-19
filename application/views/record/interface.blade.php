@layout('layouts/main')

@section('navigation')
@parent
@endsection

@section('controlbar')
    <li><a href="#" id="toggleTOC" data-target="#table-of-contents" data-toggle="cookie-view" data-cookie="show_toc">TOC</a></li>
    @if (Authority::can('edit', 'Record'))
        <li><a href="#" id="toggleEditor" data-target="#editor-toolbar" data-toggle="cookie-view" data-cookie="show_editor">Editor</a></li>
    @endif
    <li class="active"><a href="#" id="toggleLinks" data-target="#linksPane" data-toggle="cookie-view" data-cookie="show_links">Links</a></li>
@if (Authority::can('edit', 'Record'))
    <li class="divider-vertical"></li>
    </ul>
    <ul id="editor-toolbar" class="nav">
        <li class="save-button"><a href="#" id="save" class="caret-before">Save</a></li>
        <li class="save-button dropdown">
            <a href="#" id="dropdown-save" data-toggle="dropdown" class="caret-after dropdown-toggle"><b class="caret"></b></a>
            <ul class="dropdown-menu">
                <li><a href="#" id="save-template" data-toggle="modal" data-target="#save-template-modal">As template</a></li>
            </ul>
        </li>
        <li><a href="{{ URL::full() }}" id="record-reload" data-toggle="confirm" data-confirm-label="{{ __('confirmations.reloadrecordtitle') }}" data-confirm-body="{{ __('confirmations.reloadrecordbody') }}">Reload</a></li>
        <li><a href="{{ URL::current() }}/delete" id="record-delete" data-toggle="confirm" data-confirm-label="{{ __('confirmations.deleterecordtitle') }}" data-confirm-body="{{ __('confirmations.deleterecordbody') }}">Delete</a></li>
        <li><a href="{{ URL::current() }}/duplicate" id="new-duplicate" class="new-record">Duplicate</a></li>
        <li class="divider-vertical"></li>
        <li id="tag-select" class="dropdown">
            <a href="#" id="tag" data-toggle="dropdown" class="dropdown-toggle">Tag <b class="caret"></b></a>
            <ul class="dropdown-menu">
                @foreach (Field::order_by('label', 'asc')->get() as $field)
                <li><a href="#">{{ $field->label }}</a></li>
                @endforeach
            </ul>
        </li>
        <li><a href="#" id="untag">Untag</a></li>
        <li class="divider-vertical"></li>
        <li data-toggle="dropdown-select">
            <select id="recordtype-select" title="Record type: ">
                @foreach (RecordType::all() as $rt)
                    <option
                    @if ($record->record_type && $rt->id == $record->record_type->id)
                    selected="selected"
                    @endif
                    value="{{ $rt->id }}">{{ $rt->name }}</option>
                @endforeach
            </select>
        </li>
@endif
        <li><a href="#" id="toggle-tags" data-target="#recordContainer" data-toggle="cookie-view" data-cookie="show_tags" data-class="showtags">Show tags</a></li>
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
            @if (Authority::can('edit', 'Record'))
            <noscript>
            <div class="alert alert-error">
                <button type="button" class="close" data-dismiss="alert">&times;</button>
                The record editor does not work without Javascript. Please enable Javascript and reload the page.
            </div>
            </noscript>
            @endif
            <div itemscope id="recordContainer" class="recordtype_{{ $record->record_type ? $record->record_type->name : '' }}">
                @if ($record->format('html'))
                    {{ $record->format('html') }}
                @else
                    <article>
                        <header></header>
                        <section></section>
                    </article>
                @endif
            </div>
            @if (Authority::can('edit', 'Record'))
            <div><button id="add-section" class="btn btn-link">Add section</button></div>
            @endif
            <div id="alerts"></div>
            <div class="instructions">
                <span class="instruction-label">Hint:</span>
                Use the first ("Citation") box for basic citation information that
                should show up directly in the search results. Use the other
                ("Expansion") boxes to enter additional information, grouping into
                paragraphs as you see fit. To tag text using the keyboard, use the
                shortcut Ctrl-J. To untag text, use the shortcut Ctrl-K.
            </div>
        </div>
        @include('components.linkpane')
    </div>
@endsection

@section('form_modals')
@parent
<div id="save-template-modal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="save-template-label" aria-hidden="true">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h3 id="save-template-label">Save as template</h3>
    </div>
    <div class="modal-body">
        @foreach (Auth::user()->templates()->get() as $template)
        @endforeach
        <label>Template name <input type="text" id="template-name"></input></label>
    </div>
    <div class="modal-footer">
        <button class="btn" data-dismiss="modal">Cancel</button>
        <button id="save-template-ok" class="btn btn-primary" data-dismiss="modal">Save</button>
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
    @if (Authority::can('edit', 'Record'))
        initializeEditor();
        
        $('.new-record').click(function () {
            $('#confirmLabel').text("{{ __('confirmations.newrecordtitle') }}");
            $('#confirmBody').text("{{ __('confirmations.newrecordbody') }}");
            $('#confirmOK').attr('data-callback', $(this).attr('id'));
            $('#confirm').modal('show');
            return false;
        });
        $('.new-record').on('confirmed', function() {
            window.location = $(this).attr('href');
        });
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
    shortcut.add('Ctrl+J', newTag);
    shortcut.add('Ctrl+K', closeTag);
    shortcut.add('Ctrl+Shift+J', closeAndOpenTag);
    shortcut.add('Ctrl+Shift+K', closeAllTags);
    shortcut.add('Ctrl+Return', saveRecord);
});

</script>
@endsection
