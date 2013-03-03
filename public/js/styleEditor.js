function loadStyle (id) {
    $('#styleEditor').load('/admin/styles_ajax/' + id, function (msg, s) { 
        if (s === 'success' || s === 'notmodified') {
            $('#styleEditor').modal('show');
            var oTable = $('#styleTable').dataTable( {
                "bFilter": false,
                "bPaginate": false,
                "aoColumns": [
                                { "sWidth": "20%" },
                                { "sWidth": "30%" },
                                { "bSortable": false, "sWidth": "35%" },
                                { "bSortable": false, "sWidth": "5%" },
                             ],
            });
            
            $('#btnAddStyle').click(function() {
                var aRow = $('#styleTable').dataTable().fnAddData(
                    [
                        '<input type="text" name="styleRecordTypes" placeholder="Record types" class="styleRecordTypes input-small"></input>',
                        '<textarea class="styleEntry"></textarea>',
                        '<div class="exampleText">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>',
                        '<button id="delNewLine" class="btn btn-mini"><i class="icon-remove"></i></button>'
                    ], false
                );
                oTable.fnPageChange( 'last' );
                createTagsManager();
            });
            $('#styleTable').on('input', '.styleEntry', null, function() {
                $(this).parent().parent().find('.exampleText').attr('style', $(this).val());
            });
            $('#styleTable').on('click', '#delNewLine', null, function() {
                $(this).parent().parent().remove();
            });
            $('#styleTable').on('click', '.delEntry', null, function() {
                delStyle($(this).parents('tr').attr('id').replace('style', ''));
                loadStyle($('#styleTable').attr('data-id'));
            });
            $('#styleEditorOK').click(function() {
                saveStyles();
                $('#styleEditor').modal('hide');
            });
            createTagsManager();
            $('.styleEntry').each(function() {
                $(this).trigger('input');
            });
        } else {
            alert("There was a problem preparing the style list, sorry.");
        }
    });

};

function createTagsManager() {
    $('.styleRecordTypes').each(function() {
        if ($(this).parent().find('input[name="hidden-styleRecordTypes"]').length > 0) {
            return;
        }
        $(this).tagsManager({
            prefilled: $(this).parent().find('.recordType').text(),
            typeahead: true,
            typeaheadSource: Object.keys(recordTypes),
            validator: function (str) {
                return (jQuery.inArray(str, Object.keys(recordTypes)) >= 0);
            }
        });
        $(this).parent().find('.recordType').remove();
    });
}

function saveStyles() {
    var styles = [];
    $('#styleTable').dataTable().$('tr').each(function () {
        var id = $(this).attr('id') ? $(this).attr('id').replace('style', '') : null;
        var style = { 'id': id, 'schema': $('#schema').val(), 'field': $('#field').val(), 'css': $(this).find('.styleEntry').val(), 'recordtypes': [] };
        var mytypes = $(this).find('input[name="hidden-styleRecordTypes"]').val().split(',');
        for (var ii in mytypes) {
            if (typeof(recordTypes[mytypes[ii]]) !== 'undefined') {
                style.recordtypes.push(recordTypes[mytypes[ii]]);
            }
        }
        styles.push(style);
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
function delStyle(style) {
    $.ajax({
        type: "POST",
        url: "/admin/styles_ajax",
        data: { 'styles': JSON.stringify([ { 'id': style, 'delete': 1 } ] ) },
        dataType: "json",
        error: function (jqXHR, err, msg) {
            alert(msg);
        },
    }).done(function(msg) {
    });
}

