@layout('layouts/ajax')

@section('content')
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h3 id="styleEditorLabel">{{ $field->field }} ({{ $field->schema }}) field</h3>
    </div>
        <div class="modal-body">
        <button id="btnAddStyle" class="btn">Add style</button>
            <div class="row-fluid">
                <table id="styleTable">
                <thead>
                <tr><td>Record types</td><td>Style</td><td>Example text</td></tr>
                </thead>
                <tbody>
                @foreach ($styles as $style)
                <tr id="style{{ $style->id }}">
                <td>
                    <input type="text" name="styleRecordTypes" placeholder="Record types" class="styleRecordTypes input-small"></input>
                </td>
                <td><textarea class="styleEntry"></textarea></td>
                <td>
                    <div class="exampleText">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
                </td>
                </tr>
                @endforeach
                </tbody>
                </table>
            </div>
            <div class="span6">
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
                        { "sWidth": "25%" },
                        { "sWidth": "30%" },
                        { "sWidth": "40%" },
                     ],
    });

    $('#btnAddStyle').click(function() {
        var aRow = $('#styleTable').dataTable().fnAddData(
            [
                '<input type="text" name="styleRecordTypes" placeholder="Record types" class="styleRecordTypes input-small"></input>',
                '<textarea class="styleEntry"></textarea>',
                '<div class="exampleText">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>'
            ], false
        );
        oTable.fnPageChange( 'last' );
        createTagsManager();
    });
    $('#styleTable').on('input', '.styleEntry', null, function() {
        $(this).parent().parent().find('.exampleText').attr('style', $(this).val());
    });
    createTagsManager();

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
</script>
@endsection
