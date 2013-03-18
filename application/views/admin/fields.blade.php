@layout('layouts/admin-tree')

@section('sidetoolbar')
<a id="add-field" class="btn btn-small jstree-draggable" href="/resources/field/new/admin">Add field</a>
@endsection

@section('toolbar')
<button class="btn btn-small" type="submit" id="saveField" form="fieldform">Save</button>
<button class="btn btn-small" id="delField">Delete</button>
@endsection

@section('treedata')
@include('components.fieldtree')
@endsection

@section('editor')
<div id="fieldeditor">
@if ($id)
@include('components.fieldeditor')
@endif
</div>
@endsection

@section('form_modals')
<div id="styleEditor" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="styleEditorLabel" aria-hidden="true">
</div>
@endsection

@section('scripts')
@parent
<script type="text/javascript">
var controlColumn = '<button class="btn btn-mini editStyle"><i class="icon-pencil"></i></button>';
var recordTypes = { 
    @foreach (RecordType::all() as $recordtype)
        '{{ $recordtype->name }}': {{ $recordtype->id }},
    @endforeach
}; //'Book', 'Person', 'Organization', 'Stamp', 'Coin' ];
var treeCallbacks = {
    'move_node' : function(e, data) {
        $.ajax({
            url: '/resources/field',
            type: "POST",
            dataType: "json",
            data: { 'id': data.rslt.o[0].getAttribute('data-id'),
                    'parent': data.rslt.np[0].getAttribute('data-id')
                  }
        });
    },
    'create' : function(e, data) {
        $('#fieldeditor').load('/resources/field/new/editor', function (msg, s) { 
            initializeStyleEditor();
            $('#heading').text(data.rslt.name);
            $('#field-schema').val(data.rslt.name.replace(/^[^(]*\(/, '').replace(/\).*$/, ''));
            $('#field-field').val(data.rslt.name.replace(/ \(.*$/, ''));
            $('#tree .selected').removeClass('selected');
            $(data.rslt.obj).children('a').addClass('selected');
            if (data.args[1] === 'inside') {
                $('#field-parent').val(data.rslt.parent[0].getAttribute('data-id'));
            } else {
                $('#field-parent').val('');
            }
            window.history.pushState({ 'event' : 'new' }, 'New field', '/resources/field/new/admin');
        });
    }
};

var resourcetype = 'field';

$(document).ready(function() {
    $('#tree').on('click', 'a', null, function() {
        $('#tree .selected').removeClass('selected');
        $(this).addClass('selected');
        var id = $(this).parents('li').first().attr('data-id');
        var fieldParent = $(this).parents('li').first().parents('li').first().attr('data-id');
        if (fieldParent === 'undefined') {
            fieldParent = '';
        }
        $('#field-parent').val(fieldParent);
        $('#fieldeditor').load('/resources/field/' + id + '/editor', function (msg, s) { 
            initializeStyleEditor();
        });
        return false;
    });
    $(document).on('change', '#field-field, #field-schema', null, function() {
        $('#heading').text($('#field-field').val() + ' (' + $('#field-schema').val() + ')');
        $('#saveField').addClass('btn-info');
    });
    initializeTree(treeCallbacks);
    $('#add-field').click(function() {
        $('#tree').jstree('create', null, 'last', 'New field');
        return false;
    });
    initializeStyleEditor();
    $('#delField').click(function() {
        $.ajax({
            url: '/resources/field',
            type: "POST",
            dataType: "json",
            data: { 'id': $('#field-id').val(),
                    'delete': true,
                  }
        }).done(function() {
            $('#fieldeditor').empty()
            initializeTree(treeCallbacks);
        });;
    });
    $('#saveField').click(function() {
        $.ajax({
            url: '/resources/field',
            type: "POST",
            dataType: "json",
            data: { 'id': $('#field-id').val(),
                    'field': $('#field-field').val(),
                    'schema': $('#field-schema').val(),
                    'description': $('#field-description').val(),
                    'parent': $('#field-parent').val(),
                    'primary': $('#field-primary').is(':checked') ? 1 : 0
                  }
        }).done(function (data) {
            $('#field-id').val(data.attributes.id);
            window.history.replaceState({ 'event' : 'save', 'id' : data.id }, 'Field ' + data.attributes.id, '/resources/field/' + data.attributes.id + '/admin');
            $('#tree .selected').each(function() {
                $(this).parent().attr('data-id', data.attributes.id);
                $(this).attr('href', '/resources/field/' + data.attributes.id + '/admin');
            });
            $('#saveField').removeClass('btn-info');
        });
        return false;
    });
    $('#saveLinks').click(function() {
    });
});
</script>
@endsection
