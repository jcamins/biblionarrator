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
        "sAjaxSource": '/resources/' + resourcetype,
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
                        var thisRow = [json.aaData[ii]['id']];
                        columns.forEach(function (column) {
                            thisRow.push(json.aaData[ii][column.name]);
                        });
                        thisRow.push(controlColumn);
                        newData.push(thisRow);
                    }
                    json.aaData = newData;
                    fnCallback(json);
                }
            } );
        },
        "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
            var noEditFields = [0];
            var objectID = $('td', nRow)[0].innerHTML;
            $(nRow).attr("data-id", objectID);
            $('td:eq(0)', nRow).click(function() {$(this.parentNode).toggleClass('selected',this.clicked);}); /* add row selectors */
            $('td:eq(0)', nRow).attr("title", "Click ID to select/deselect row");
            if (isNaN(objectID)) {
                for (var ii = 1; ii <= columns.count + 2; ii++) {
                    noEditFields.push(ii);
                }
            }
            else {
                noEditFields.push($('td', nRow).size() - 1);
            }
            /* apply no_edit class to noEditFields */
            for (i=0; i<noEditFields.length; i++) {
                $('td', nRow)[noEditFields[i]].setAttribute("class","no_edit");
            }
            return nRow;
        },
        "fnDrawCallback": fnDrawCallback,
    } );
    $('#btnAdd').click(addNewRow);
    $('#admintable').on('click', '.cancelAdd', null, function() {
        $('#admintable').dataTable().fnDeleteRow(this.parentNode.parentNode);
    });
}

function addNewRow() {
    var newdata = [ 'NA' ];
    columns.forEach(function (column) {
        newdata.push('<input id="column' + column.name + '" name="' + column.name + '" class=columnEntry" type="text" style="height: 14px; width: 99%;" />');
    });
    newdata.push('<button type="submit" title="Save" class="btn btn-mini"><i class="icon-ok"></i></button><button title="Cancel" class="cancelAdd btn btn-mini"><i class="icon-remove"></i></button>');
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
                url: '/resources/' + resourcetype,
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
                url: '/resources/' + resourcetype,
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
