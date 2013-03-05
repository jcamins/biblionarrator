function initializeAdminTable() {
    columns.forEach(function(column) {
        $('#admintable thead tr').append('<th>' + column.label + '</th>');
    });
    $('#admintable thead tr').append('<th></th>');
    var dtColumns = [ { "bSortable": false, "sWidth": "5%" } ];
    dtColumns = dtColumns.concat(columns, { "bSortable": false, "sWidth": "5%" });

    var oTable = $('#admintable').dataTable( {
        "bPaginate": true,
        "bProcessing": true,
        "sAjaxSource": posturl,
        "sPaginationType": "full_numbers",
        "aoColumns": dtColumns,
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
        "fnDrawCallback": fnDrawCallback,
    } );
    $('#btnAdd').click(addNewRow);
}

function addNewRow() {
    var newdata = [ 'NA' ];
    columns.forEach(function (column) {
        newdata.push('<input id="column' + column.name + '" class=columnEntry" type="text" style="height: 14px; width: 99%;" />');
    });
    newdata.push('');
    var aRow = $('#admintable').dataTable().fnAddData(newdata, false);
    $('#admintable').dataTable().fnPageChange( 'last' );
    $('.columnEntry').first().focus();

    $('.columnEntry').keydown(fnClickAddRow);
}

function fnDrawCallback() {
    var oTable = $('#admintable').dataTable();
    $('#admintable tbody td[class!="no_edit"]').editable(
        function(value, settings) {
            var dataRow = oTable.fnGetData(oTable.fnGetPosition(this)[0]);
            dataRow[oTable.fnGetPosition(this)[2]] = value;
            var newdata = { 'id': dataRow[0] };
            columns.forEach(function(column, index) {
                newdata[column.name] = dataRow[index + 1];
            });
            $.ajax({
                url: posturl,
                type: "POST",
                data: newdata,
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
    $('#admintable tbody td[class!="no_edit"]').keydown(function(evt) {
        if(evt.keyCode==9) {
            /* Submit the current element */
            $('input', this)[0].blur();
        
            /* Activate the next element */
            if ( $(this).next('#admintable tbody td[class!="no_edit"]').length == 1 ) {
                $(this).next('#admintable tbody td[class!="no_edit"]').click();
            }
            return false;
        }
    } );
}

function fnClickAddRow(e) {
    node = this.parentNode.parentNode;
    if (e.keyCode == 13) {
        var postdata = new Object();
        var havereqs = true;
        columns.forEach(function(column) {
            postdata[column.name] = $('#column' + column.name).val();
            if (column.required && $('#column' + column.name).val().length === 0) {
                havereqs = false;
            }
        });

        if (havereqs) {
            $.ajax({
                url: posturl,
                type: "POST",
                data: postdata,
                success: function(data){
                    var oTable = $('#admintable').dataTable();
                    oTable.fnReloadAjax();
                    oTable.fnPageChange( 'last' );
                    $('#btnAdd').click(addNewRow);
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
            $('#admintable').dataTable().fnDeleteRow(node);
        }
        else {
            return;
        }
    }
}
