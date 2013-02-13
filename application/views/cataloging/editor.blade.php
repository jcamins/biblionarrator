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
            <a href="#tagSelector" role="button" class="btn" data-toggle="modal">Select tag</a>
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
@endsection

@section('scripts')
<script type="text/javascript">
tinyMCE.init({
    mode : "specific_textareas",
    editor_selector : "record_editor",
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
    },
});
</script>
<script type="text/javascript">
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
        saveData();
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
});

$(window).load(function() {
    loadData();
});

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

    tinyMCE.activeEditor.formatter.remove(styles[0]);
    tinyMCE.activeEditor.nodeChanged();
    tinyMCE.execCommand('mceFocus', false, tinyMCE.activeEditor.id);
}

function loadData() {
    var ed = tinyMCE.get('whatever');

    // Do you ajax call here, window.setTimeout fakes ajax call
    ed.setProgressState(1); // Show progress
    $.ajax({
        type: "GET",
        url: "/svc/record",
        data: { id: "1" }
    }).done(function(msg) {
        var obj = jQuery.parseJSON(msg);
        ed.setProgressState(0); // Hide progress
        ed.setContent(obj.data);
    });
}
function saveData() {
    var ed = tinyMCE.get('whatever');

    // Do you ajax call here, window.setTimeout fakes ajax call
    ed.setProgressState(1); // Show progress
    $.ajax({
        type: "POST",
        url: "/svc/record",
        data: { id: "1", data: ed.getContent() }
    }).done(function(msg) {
        ed.setProgressState(0); // Hide progress
    });
}
</script>
@endsection
