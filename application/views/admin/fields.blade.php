@layout('layouts/main')

@section('navigation')
@parent
<!--<li><a class="active" href="/cataloging/fields">Record fields</a></li>-->
@endsection

@section('toolbar')
    <button id="btnAddField" class="btn">Add field</button>
@endsection

@section('content')
    <div class="row-fluid">
        <div class="span6">
            <table id="fields">
                <thead><tr><th>ID</th><th>Schema</th><th>Field</th><th>Description</th><th></th></tr></thead>
                <tbody></tbody>
            </table>
        </div>
    </div>
@endsection

@section('form_modals')
<div id="styleEditor" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="styleEditorLabel" aria-hidden="true">
</div>
@endsection

@section('scripts')
<script type="text/javascript">
$(document).ready(function() {
    var oTable = $('#fields').dataTable( {
        "bPaginate": true,
        "bProcessing": true,
        "sAjaxSource": "/svc/fields",
        "sPaginationType": "full_numbers",
        "aoColumns": [
                        { "bSortable": false, "sWidth": "5%" },
                        { "sWidth": "20%" },
                        { "sWidth": "30%" },
                        { "sWidth": "40%" },
                        { "bSortable": false, "sWidth": "5%" },
                     ],
        "fnServerData": function ( sSource, aoData, fnCallback, oSettings ) {
            oSettings.jqXHR = $.ajax( {
                "dataType": 'json',
                "type": "GET",
                "url": sSource,
                "data": aoData,
                "success": function (json) {
                    var newData = [];
                    for ( var ii = 0, iLen = json.iTotalRecords ; ii < iLen ; ii++ ) {
                        newData.push( [json.aaData[ii]['id'], json.aaData[ii]['schema'], json.aaData[ii]['field'], json.aaData[ii]['description'], '<button id="editStyle' + json.aaData[ii]['id'] + '" class="btn btn-mini editStyle"><i class="icon-pencil"></i></button>'] );
                    }
                    json.aaData = newData;
                    fnCallback(json);
                }
            } );
        },
        "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
            /* do foo on the current row and its child nodes */
            var noEditFields = [];
            var fieldID = $('td', nRow)[0].innerHTML;
            $(nRow).attr("id", fieldID); /* set row ids to quote id */
            $('td:eq(0)', nRow).click(function() {$(this.parentNode).toggleClass('selected',this.clicked);}); /* add row selectors */
            $('td:eq(0)', nRow).attr("title", "Click ID to select/deselect field");
            // $('td', nRow).attr("id",fieldID); /* FIXME: this is a bit of a hack */
            if (isNaN(fieldID)) {
                noEditFields = [0,1,2,3,4]; /* all fields when adding a quote */
            }
            else {
                noEditFields = [0, 4]; /* id, timestamp */
            }
            /* apply no_edit id to noEditFields */
            for (i=0; i<noEditFields.length; i++) {
                $('td', nRow)[noEditFields[i]].setAttribute("class","no_edit");
            }
            return nRow;
        },
        "fnDrawCallback": function () {
            $('#fields tbody td[class!="no_edit"]').editable(
                function(value, settings) {
                    var dataRow = oTable.fnGetData(oTable.fnGetPosition(this)[0]);
                    dataRow[oTable.fnGetPosition(this)[2]] = value;
                    $.ajax({
                        url: "/svc/field",
                        type: "POST",
                        data: {
                            "id" : dataRow[0],
                            "schema" : dataRow[1],
                            "field" : dataRow[2],
                            "description" : dataRow[3],
                        }
                    });
                    return value;
                } ,
                {
                    "onblur" : "submit",
                    "select" : true,
                    "callback": function( sValue, y ) {
                        var aPos = oTable.fnGetPosition( this );
                        oTable.fnUpdate( sValue, aPos[0], aPos[1], false, false );
                    },
                    "height": "14px"
                }
            );
            $('#fields tbody td[class!="no_edit"]').keydown(function(evt) {
                if(evt.keyCode==9) {
                    /* Submit the current element */
                    $('input', this)[0].blur();
                     
                    /* Activate the next element */
                    if ( $(this).next('#fields tbody td[class!="no_edit"]').length == 1 )
                    {
                        $(this).next('#fields tbody td[class!="no_edit"]').click();
                    }
                    return false;
                }
            } );
        }
    } );
    $('#btnAddField').click(function() {
        var aRow = oTable.fnAddData(
            [
                'NA',
                '<input id="fieldSchema" type="text" style="height:14px; width:99%"/>',
                '<input id="fieldField" type="text" style="height:14px; width:99%"/>', 
                '<input id="fieldDescription" type="text" style="height:14px; width:99%"/>',
                ''
            ],
            false
        );
        oTable.fnPageChange( 'last' );
        $('#fieldSchema').focus();

        $('#fieldSchema,#fieldField,#fieldDescription').keydown(fnClickAddField);
    });
    $('#fields').on('click', '.editStyle', null, function() {
        $('#styleEditor').empty();
        $('#styleEditor').load('/admin/styles_ajax/' + $(this).attr('id').replace('editStyle', ''), function (msg, s) { 
            if (s === 'success' || s === 'notmodified') {
                $('#styleEditor').modal('show');
            } else {
                alert("There was a problem preparing the style list, sorry.");
            }
        });
    });
    $('#styleEditor').on('shown', function() {
        loadStyle();
    });
});

function fnClickAddField(e) {
    node = this.parentNode.parentNode;
    if (e.keyCode == 13) {
        var fieldSchema = $('#fieldSchema').val();
        var fieldField = $('#fieldField').val();
        var fieldDescription = $('#fieldDescription').val();

        if (fieldSchema && fieldField) {
            $.ajax({
                url: "/svc/field",
                type: "POST",
                data: {
                    "schema": fieldSchema,
                    "field": fieldField,
                    "description": fieldDescription,
                },
                success: function(data){
                    var oTable = $('#fields').dataTable();
                    oTable.fnReloadAjax();
                    oTable.fnPageChange( 'last' );
                    //$('.add_quote_button').attr('onclick', 'fnClickAddRow()'); // re-enable add button
                },
                error: function(jqXHR, textStatus, errorThrown){
                    alert(textStatus);
                    alert(errorThrown);
                },
            });
        }
    }
    else if (e.keyCode == 27) {
        if (confirm("Are you sure you want to cancel adding this quote?")) {
            $('#fields').dataTable().fnDeleteRow(node);
        }
        else {
            return;
        }
    }
}
</script>
@endsection
