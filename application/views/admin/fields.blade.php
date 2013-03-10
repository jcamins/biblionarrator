@layout('layouts/admin-tree')

@section('sidetoolbar')
<a class="btn btn-small jstree-draggable" href="/admin/fields/new">Add field</a>
@endsection

@section('toolbar')
<button class="btn btn-small" type="submit" id="saveField" form="fieldform">Save</button>
@endsection

@section('treedata')
<ul>
    {{ render_each('components.fieldtree', Field::roots()->get(), 'node') }}
</ul>
@endsection

@section('editor')
<div id="fieldeditor">
@include('components.fieldeditor')
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

$(document).ready(function() {
/*    $('#admintable').on('click', '.editStyle', null, function() {
        $('#styleEditor').empty();
    });*/
    $('#tree li[data-id="' + $('#fieldform').attr('data-id') + '"] a').addClass('selected');
    $('#tree').on('click', 'a', null, function() {
        $('#tree .selected').removeClass('selected');
        $(this).addClass('selected');
        //loadStyle($(this).parents('li').first().attr('data-id'));
        var id = $(this).parents('li').first().attr('data-id');
        $('#fieldeditor').load('/admin/fieldeditor/' + id, function (msg, s) { 
            initializeStyleEditor();
        });
        return false;
    });
    $('#tree').jstree({
        "defaults": {
            "strings": {
                "new_node": "New field",
            }
        },
        "dnd" : {
            "drag_check": function(data) {
                return { after : true, before : true, inside : true }; 
            },
            "drag_finish": function(data) {
                $('#tree').jstree('create', data.r, data.p);
            }
        },
        "themes": {
            "theme": "apple"
        },
        "ui": {
            "select_limit": 1
        },
        "plugins" : [ "themes", "html_data", "crrm", "dnd" ]
    });
    $('#tree').bind('create.jstree', function(e, data) {
        $('#fieldeditor').load('/admin/fieldeditor/new', function (msg, s) { 
            initializeStyleEditor();
            $('#heading').text(data.rslt.name);
            var schema = data.rslt.name;
            schema.replace('^[^(]*\(', '').replace(').*$', '');
            var field = data.rslt.name;
            field.replace(' \(.*$', '');
            $('#field-schema').val(schema);
            $('#field-field').val(field);
        });
    });
    initializeStyleEditor();
    $('#saveField').click(function() {
        $.ajax({
            url: '/resources/field',
            type: "POST",
            data: { 'id': $('#field-id').val(),
                    'field': $('#field-field').val(),
                    'schema': $('#field-schema').val(),
                    'description': $('#field-description').val()
                  }
        });
        return false;
    });
});
</script>
@endsection
