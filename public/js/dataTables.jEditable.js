
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

