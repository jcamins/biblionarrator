function initializeAdminTable() {
    Object.keys(columns).forEach(function(column) {
        $('#admintable thead tr').append('<th>' + columns[column].label + '</th>');
    });
    $('#admintable thead tr').append('<th></th>');
    var dtColumns = [ { "bSortable": false, "sWidth": "5%" } ];
    Object.keys(columns).forEach(function(column) {
        dtColumns = dtColumns.concat({ "sWidth": columns[column].sWidth });
    });
    dtColumns = dtColumns.concat({ "bSortable": false, "sWidth": "5%" });

    var oTable = $('#admintable').dataTable( {
        "bPaginate": true,
        "bProcessing": true,
        "sAjaxSource": '/resources/' + resourcetype,
        "sDom": '<"dataTables_controls top"lf>rt<"dataTables_controls"ip>',
        'sPaginationType': 'full_numbers',
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
                        Object.keys(columns).forEach(function (column) {
                            thisRow.push('<span data-column="' + column + '" class="editable-column editable-' + columns[column].type + '">' + json.aaData[ii][column] + '</span>');
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
            if (isNaN(objectID)) {
                $('td:eq(0)', nRow).click(function() {$(this.parentNode).toggleClass('selected',this.clicked);}); /* add row selectors */
                $('td:eq(0)', nRow).attr("title", "Click ID to select/deselect row");
            } else {
                $(nRow).attr("data-id", objectID);
            }
            return nRow;
        },
        "fnDrawCallback": fnDrawCallback,
    } );
    $('.new-form').submit(function (e) {
        saveNew();
        e.preventDefault();
        return false;
    });
    $('#btnAdd').click(addNewRow);
    $('#admintable').on('click', '.delete-object', null, function (e) {
        deleteObject($(this).parents('tr').first());
        e.preventDefault();
        return false;
    });
    $('#admintable').on('click', '.cancelAdd', null, function() {
        $('#admintable').dataTable().fnDeleteRow(this.parentNode.parentNode);
    });
}

function addNewRow() {
    var newdata = [ 'NA' ];
    Object.keys(columns).forEach(function (column) {
        if (columns[column].type === 'string') {
            newdata.push('<input id="column' + column + '" name="' + column + '" data-column="' + column + '" class="form-column" type="text" style="height: 14px; width: 99%;" />');
        } else if (columns[column].type === 'options') {
            newdata.push(generateSelect(column, '', { 'select-class': 'form-column' }));
        }
    });
    newdata.push('<button title="Save" type="submit" class="btn btn-mini"><i class="icon-ok"></i></button><button title="Cancel" class="cancelAdd btn btn-mini"><i class="icon-remove"></i></button>');
    var aRow = $('#admintable').dataTable().fnAddData(newdata, false);
    $('#admintable').dataTable().fnPageChange( 'last' );
    $('.form-column').first().focus();
    $('.form-column').keydown(fnClickAddRow);
}

function fnDrawCallback() {
    var oTable = $('#admintable').dataTable();
    $('.editable-string').editable(
        function(value, settings) {
            var updates = {};
            updates[$(this).attr('data-column')] = value;
            saveRow($(this).parents('tr').first(), updates );
            return value;
        } ,
        {
            "onblur" : "submit",
            "select" : true,
            "height": "16px"
        }
    );
    $('.editable-string').keydown(function(evt) {
        if(evt.keyCode==9) {
            /* Submit the current element */
            $('input', this)[0].blur();
        
            /* Activate the next element */
            if ( $(this.parentNode).nextAll('td').find('.editable-column').first().length == 1 ) {
                $(this.parentNode).nextAll('td').find('.editable-column').first().click();
            }
            return false;
        }
    } );
    $('.editable-options').click(function () {
        if ($(this).find('select').length > 0) {
            return true;
        }
        var cur = $(this).text();
        var html = '<form>';
        html += generateSelect($(this).attr('data-column'), cur);
        html += '</form>';
        $(this).html(html);
        $(this).find('select').change(function () {
            var updates = {};
            var value = $(this).find('option:selected').text();
            var row = $(this).parents('tr').first();
            $(this).parents('span').first().text(value);
            updates[$(this).attr('data-column')] = value;
            saveRow(row, updates);
        });
        $(this).find('select').click();
    } );
}

function fnClickAddRow(e) {
    node = this.parentNode.parentNode;
    if (e.keyCode == 13) {
        saveNew();
        return false;
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

function saveRow(row, updates) {
    var newdata = { 'id': $(row).attr('data-id') };
    $(row).find('.editable-column, .form-column').each(function () {
        switch ($(this).prop('tagName')) {
            case 'INPUT':
                newdata[$(this).attr('data-column')] = $(this).val();
                break;
            case 'SELECT':
                newdata[$(this).attr('data-column')] = $(this).find('option:selected').text() || $(this).find('option:first').text();
                break;
            default:
                newdata[$(this).attr('data-column')] = $(this).text();
                break;
        }
    })
    for (var attrname in updates) { newdata[attrname] = updates[attrname]; }
    Object.keys(newdata).forEach(function (key) {
        if (typeof(columns[key]) === 'undefined') {
            return;
        }
        var target = key;
        var val = newdata[key];
        if (typeof(columns[key].target) !== 'undefined') {
            target = columns[key].target;
            delete newdata[key];
        }
        if (columns[key].type === 'string') {
            newdata[target] = val;
        } else if (columns[key].type === 'options') {
            newdata[target] = eval(columns[key]['options'])[val];
        }
    });
    $.ajax({
        url: '/resources/' + resourcetype,
        type: "POST",
        data: newdata,
    }).success(function () {
        var oTable = $('#admintable').dataTable();
        oTable.fnReloadAjax();
        oTable.fnPageChange( 'last' );
        $('#btnAdd').click(addNewRow);
    });
}

function generateSelect(column, cur, opt) {
    var options = eval(columns[column]['options']);
    var html = '<select class="' + (opt && opt['select-class'] ? opt['select-class'] : '') + '" data-column="' + column + '">';
    Object.keys(options).sort().forEach(function (obj) {
        html += '<option';
        if (obj === cur) {
            html += ' selected="selected"';
        }
        html += '>' + obj + '</option>';
    });
    html += '</select>';
    return html;
}

function saveNew() {
    var postdata = new Object();
    var missing = [];
    var havereqs = true;
    Object.keys(columns).forEach(function(column) {
        var val;
        if (columns[column].type === 'string') {
            val = $('#column' + column).val();
        }
        if (columns[column].required && val.length === 0) {
            missing.push(columns[column].label);
        }
    });
    
    if (missing.length === 0) {
        saveRow(node, postdata);
    } else {
        alert("You must provide values for " . missing.join(', '));
    }
}

function deleteObject(obj) {
    $.ajax({
        url: '/resources/' + resourcetype,
        type: "DELETE",
        data: { 'id': $(obj).attr('data-id') }
    }).success(function () {
        $('#admintable').dataTable().fnDeleteRow(obj);
    });
}
