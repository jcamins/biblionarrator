@layout('layouts/ajax')

@section('content')
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h3 id="styleEditorLabel">{{ $field->field }} ({{ $field->schema }}) field</h3>
    </div>
        <div class="modal-body">
        <input type="hidden" id="schema" value="{{ $field->schema }}"></input>
        <input type="hidden" id="field" value="{{ $field->field }}"></input>
        <button id="btnAddStyle" class="btn">Add style</button>
            <div class="row-fluid">
                <table id="styleTable">
                <thead>
                <tr><th>Record types</th><th>Style</th><th>Example text</th><th></th></tr>
                </thead>
                <tbody>
                @foreach ($styles as $style)
                <tr id="style{{ $style->id }}">
                <td>
                    <input type="text" name="styleRecordTypes" placeholder="Record types" class="styleRecordTypes input-small"></input>
                </td>
                <td><textarea class="styleEntry">{{ $style->css }}</textarea></td>
                <td>
                    <div class="exampleText">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
                </td>
                <td>
                    <button class="btn btn-mini delEntry"><i class="icon-remove"></i></button>
                </td>
                </tr>
                @endforeach
                </tbody>
                </table>
            </div>
            </div>
        </div>
    <div class="modal-footer">
        <button id="styleEditorCancel" class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
        <button id="styleEditorOK" class="btn btn-primary">Save</button>
    </div>
@endsection

@section('scripts')
<script type="text/javascript">
var recordTypes = [ 'Book', 'Person', 'Organization', 'Stamp', 'Coin' ];
$(document).ready(function () {
    var oTable = $('#styleTable').dataTable( {
        "bFilter": false,
        "bPaginate": false,
        "aoColumns": [
                        { "sWidth": "20%" },
                        { "sWidth": "30%" },
                        { "bSortable": false, "sWidth": "40%" },
                        { "bSortable": false, "sWidth": "5%" },
                     ],
    });

    $('#btnAddStyle').click(function() {
        var aRow = $('#styleTable').dataTable().fnAddData(
            [
                '<input type="text" name="styleRecordTypes" placeholder="Record types" class="styleRecordTypes input-small"></input>',
                '<textarea class="styleEntry"></textarea>',
                '<div class="exampleText">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>',
                '<button class="btn btn-mini delEntry"><i class="icon-remove"></i></button>'
            ], false
        );
        oTable.fnPageChange( 'last' );
        createTagsManager();
    });
    $('#styleTable').on('input', '.styleEntry', null, function() {
        $(this).parent().parent().find('.exampleText').attr('style', $(this).val());
    });
    $('#styleEditorOK').click(saveStyles);
    createTagsManager();
    $('.styleEntry').each(function() {
        $(this).trigger('input');
    });

});
function createTagsManager() {
    $('.styleRecordTypes').each(function() {
        if ($(this).parent().find('input[name="hidden-styleRecordTypes"]').length > 0) {
            return;
        }
        $(this).tagsManager({
            typeahead: true,
            typeaheadSource: recordTypes,
            validator: function (str) {
                return (jQuery.inArray(str, recordTypes) >= 0);
            }
        });
    });
}

function saveStyles() {
    var styles = [];
    $('#styleTable').dataTable().$('tr').each(function () {
        var id = $(this).attr('id') ? $(this).attr('id').replace('style', '') : null;
        styles.push({ 'id': id, 'schema': $('#schema').val(), 'field': $('#field').val(), 'css': $(this).find('.styleEntry').val() });
    });
    $.ajax({
        type: "POST",
        url: "/admin/styles_ajax",
        data: { 'styles': JSON.stringify(styles) },
        dataType: "json",
        error: function (jqXHR, err, msg) {
            alert(msg);
        },
    }).done(function(msg) {
        var obj = msg;
        var ii = 0;
        $('#styleTable').dataTable().$('tr').each(function () {
            var id = obj[ii++];
            if (typeof(id) === 'number') {
                $(this).attr('id', 'style' + id);
            }
        });
    });
}
</script>
@endsection
