@layout('layouts/admin.tree')

@section('controlbar')
<li><a id="add-field" class="jstree-draggable" href="/admin/field/new"><i class="icon-hand-down"></i> Add field</a></li>
<li class="divider-vertical"></li>
<li><a href="#" type="submit" id="saveField" form="fieldform">Save</a></li>
<li><a href="#" id="delField">Delete</a></li>
@endsection

@section('sidebar')
@parent
<div class="instructions">
<span class="instruction-label">Hint:</span>
Drag the "Add field" button into the tree in order to add a field at a
particular place. Clicking the "Add field" button will add a new button
at the end of the tree at the top-most level.
</div>
@endsection

@section('treedata')
@include('ajax.field-tree')
@endsection

@section('editor')
<div id="fieldeditor">
@if ($id)
@include('ajax.field-editor')
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
            $('#field-label').text(data.rslt.name);
            $('#field-schema').val();
            $('#field-field').val(data.rslt.name.toLowerCase());
            $('#tree .selected').removeClass('selected');
            $(data.rslt.obj).children('a').addClass('selected');
            if (data.args[1] === 'inside') {
                $('#field-parent').val(data.rslt.parent[0].getAttribute('data-id'));
            } else {
                $('#field-parent').val('');
            }
            window.history.pushState({ 'event' : 'new' }, 'New field', '/admin/field/new');
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
        $('#saveField').addClass('field-changed');
    });
    initializeTree(treeCallbacks);
    $('#add-field').click(function() {
        $('#tree').jstree('create', null, 'last', 'New field');
        return false;
    });
    initializeStyleEditor();
    $('#delField').click(function() {
        $.ajax({
            url: '/resources/' + resourcetype,
            type: "DELETE",
            data: { 'id': $('#field-id').val() }
        }).done(function() {
            $('#fieldeditor').empty()
            initializeTree(treeCallbacks);
        });
        return false;
    });
    $('#saveField').click(function() {
        $.ajax({
            url: '/resources/field',
            type: "POST",
            dataType: "json",
            data: { 'id': $('#field-id').val(),
                    'field': $('#field-field').val(),
                    'schema': $('#field-schema').val(),
                    'label': $('#field-label').text(),
                    'description': $('#field-description').val(),
                    'parent': $('#field-parent').val(),
                    'link': $('#field-link').is(':checked') ? 1 : 0,
                    'primary': $('#field-primary').is(':checked') ? 1 : 0,
                    'sortable': $('#field-sortable').is(':checked') ? 1 : 0,
                  }
        }).done(function (data) {
            $('#field-id').val(data.id);
            window.history.replaceState({ 'event' : 'save', 'id' : data.id }, 'Field ' + data.id, '/admin/field/' + data.id);
            $('#tree .selected').each(function() {
                $(this).parent().attr('data-id', data.id);
                $(this).attr('href', '/admin/field/' + data.id);
            });
            $('#saveField').removeClass('field-changed');
        });
        return false;
    });
    $('#saveLinks').click(function() {
    });
});
</script>
@endsection
