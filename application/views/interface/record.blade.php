@layout('layouts/main')

@section('navigation')
@parent
<li><a class="active" href="/catalog/record/{{ $recordId }}">Record {{ $recordId }}</a></li>
@endsection

@section('content')
<div class="hero-unit">
    <div class="row">
        <div class="span6">
            <h1>Record editor</h1>
            <p>This is the greatest record editor ever!</p>
            
            <div itemscope id="recordContainer">
                {{ $record }}
            </div>
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
@endsection

@section('scripts')
<script type="text/javascript">
var recordId = '{{ $recordId }}';
var fieldlookup = {
    @foreach ($fields as $field)
        '{{ $field->field }} ({{ $field->schema }})': '{{ $field->schema }}:{{ $field->field }}',
    @endforeach
    };
initializeTinyMCE(fieldlookup);
</script>
<script type="text/javascript">
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
//    loadRecord();
});

</script>
@endsection
