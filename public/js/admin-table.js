function initializeAdminTable() {
    Object.keys(columns).forEach(function(column) {
        $('#admintable thead tr').append('<th>' + columns[column].label + '</th>');
    });
    $('#admintable thead tr').append('<th></th>');
    var dtColumns = [ { "sType": "numeric", "sWidth": "5%" } ];
    Object.keys(columns).forEach(function(column) {
        dtColumns = dtColumns.concat({ "sWidth": columns[column].sWidth });
    });
    dtColumns = dtColumns.concat({ "bSortable": false, "bSearchable": false, "sWidth": "5%" });

    var oTable = $('#admintable').dataTable( {
        "bPaginate": true,
        "bProcessing": true,
        "sAjaxSource": '/resources/' + resourcetype,
        "sDom": '<"dataTables_controls top resultcount header-shown"i>rt<"dataTables_controls"pl>',
        "sPaginationType": "bootstrap",
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
                        var thisRow = [json.aaData[ii].id];
                        Object.keys(columns).forEach(function (column) {
                            var cell = '<span data-column="' + column + '" class="editable-column editable-' + columns[column].type + '"';
                            if (columns[column].type === 'options') {
                                cell += ' data-value="' + json.aaData[ii][column + '_id'] + '"';
                            }
                            cell += '>' + json.aaData[ii][column] + '</span>';
                            thisRow.push(cell);
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
            if (!isNaN(objectID)) {
                $(nRow).attr("data-id", objectID);
            }
            return nRow;
        },
        "fnDrawCallback": fnDrawCallback
    } );
    $('#admintable-filter').keyup(function () {
        oTable.fnFilter($(this).val(), null, false, true);
    });
    $('#btnAdd').click(addNewRow);
    $('#admintable').on('click', '.delete-object', null, function (e) {
        deleteObject($(this).parents('tr').first());
    });
    $('#admintable').on('click', '.cancelAdd', null, function() {
        $('#admintable').dataTable().fnDeleteRow(this.parentNode.parentNode);
    });
}

function addNewRow() {
    if ($('.save-new').size() > 0) {
        return;
    }
    var newdata = [ 'NA' ];
    Object.keys(columns).forEach(function (column) {
        newdata.push('<span id="column' + column + '" data-column="' + column + '" class="form-column form-' + columns[column].type + '"></span>');
    });
    newdata.push('<button title="Save" class="btn btn-mini save-new"><i class="icon-ok"></i></button><button title="Cancel" class="cancelAdd btn btn-mini"><i class="icon-remove"></i></button>');
    var aRow = $('#admintable').dataTable().fnAddData(newdata, false);
    $('#admintable').dataTable().fnPageChange( 'last' );
    $('.form-column').first().click();
    $('.form-column').keydown(function (e) {
        if (e.which == 13) {
            $('.save-new').click();
        } else if (e.which == 9 && $(this).parent().next().find('.form-column').size() > 0) {
            $(this).parent().next().find('.form-column').click();
            return false;
        } else if (e.which == 27) {
            $('#admintable').dataTable().fnReloadAjax();
        }
    });
    $('.save-new').click(saveNew);
}

function autoSaveCallback(value, settings) {
    var updates = {};
    updates[$(this).attr('data-column')] = value;
    saveRow($(this).parents('tr').first(), updates );
    return value;
}

function fnDrawCallback() {
    var oTable = $('#admintable').dataTable();
    $('.editable-string').editable(autoSaveCallback, { "onblur" : "submit" });
    $('.editable-options').each(function () {
        $(this).editable(autoSaveCallback,
            {
                "onblur" : "submit",
                "type": "select",
                "data": columns[$(this).attr('data-column')]['options']
            }
        );
    });
    $('.form-string').editable('', { "onblur" : "ignore" });
    $('.form-options').each(function () {
        $(this).editable('',
            {
                "onblur" : "ignore",
                "type": "select",
                "data": columns[$(this).attr('data-column')]['options']
            }
        );
    });
}

function saveRow(row, updates) {
    var id = $(row).attr('data-id');
    var newdata = { };
    $(row).find('.editable-column, .form-column').each(function () {
        newdata[$(this).attr('data-column')] = $(this).find('option:selected').val() ||
                $(this).find('option:first').val() ||
                $(this).find('input').val() ||
                $(this).attr('data-value') ||
                $(this).text();
    });
    for (var attrname in updates) { newdata[attrname] = updates[attrname]; }
    Object.keys(newdata).forEach(function (key) {
        if (typeof(columns[key]) !== 'undefined') {
            var target = key;
            var val = newdata[key];
            if (typeof(columns[key].target) !== 'undefined') {
                target = columns[key].target;
                delete newdata[key];
            }
            newdata[target] = val;
        }
    });
    $.ajax({
        url: '/resources/' + resourcetype + (typeof id !== 'undefined' ? '/' + id : ''),
        dataType: 'json',
        type: "POST",
        data: newdata
    }).success(function () {
        var oTable = $('#admintable').dataTable();
        oTable.fnReloadAjax();
        oTable.fnPageChange( 'last' );
    });
}

function saveNew() {
    var postdata = {};
    var missing = [];
    Object.keys(columns).forEach(function(column) {
        var val = $('#column' + column + ' input, #column' + column + ' select').val();
        if (columns[column].required && val.length === 0) {
            missing.push(columns[column].label);
        } else {
            postdata[column] = val;
        }
    });
    
    if (missing.length === 0) {
        saveRow($('.save-new').parents('tr'), postdata);
    } else {
        alert("You must provide values for " + missing.join(', '));
    }
}

function deleteObject(obj) {
    if (typeof $(obj).attr('data-id') !== 'undefined') {
        $.ajax({
            url: '/resources/' + resourcetype + '/' + $(obj).attr('data-id'),
            dataType: 'json',
            type: "DELETE",
            data: { }
        }).done(function () {
            $('#admintable').dataTable().fnReloadAjax();
        }).fail(function () {
            alert("Unable to delete object, sorry.");
        });
    }
}
