$(document).ready(function () {
    $('[data-toggle="cookie-view"]').click(function () {
        var target = $($(this).attr('data-target'));
        target.toggle();
        target.trigger('cookietoggle');
        if (target.is(':visible')) {
            jQuery.cookie($(this).attr('data-cookie'), 1);
        } else {
            jQuery.cookie($(this).attr('data-cookie'), 0);
        }
    }).each(function () {
            var target = $($(this).attr('data-target'));
        if (jQuery.cookie($(this).attr('data-cookie')) == 1) {
            $(this).addClass('active');
            target.show();
        } else {
            $(this).removeClass('active');
            target.hide();
        }
    });
});

var tocindex;

function traverseTOC(node, depth) {
    var notclause = new Array(depth + 2).join(' span');
    var outerhtml = '';
    var innerhtml = '';
    var found = false;
    $(node).find('span').not('#recordContainer' . notclause).each(function () {
        if ($(this).attr('data-match')) {
            return;
        }
        var classes = $(this).attr('class').split(' ');
        for (var ii = 0, len = classes.length; ii < len; ++ii) {
            var value = $(this).text();
            if (typeof(fieldlist[classes[ii]]) !== 'undefined' && value.length > 0) {
                $(this).attr('data-match', tocindex);
                var currentNode;
                outerhtml += '<li aria-labelledby="labelField' + tocindex + '" data-match="' + tocindex + '" class="fieldEntry' + '"><a id="labelField' + tocindex + '" class="toclabel">' + fieldlist[classes[ii]].label + '</a><ul>';
                innerhtml += '<li><a class="tocvalue">' + value + '</a></li>';
                found = true;
            }
        }
        tocindex++;
        innerhtml += traverseTOC(this, depth + 1) + '</li></ul>';
        outerhtml += innerhtml;
        innerhtml = '';
    });

    if (outerhtml.length > 0) {
        return outerhtml;
    } else {
        return '';
    }
}

function updateFieldsTOCTree(node) {
    tocindex = 1;
    $('#fieldsTOC').remove();
    $('#table-of-contents').append('<div id="fieldsTOC"></div>');
    $('#recordContainer span').each(function () {
        $(this).removeAttr('data-match');
    });
    $('#fieldsTOC').html('<ul>' + traverseTOC($('#recordContainer'), 1) + '</ul>');
    initializeTOC();
}

function initializeTOC() {
    $('#fieldsTOC').jstree({
        "plugins" : [ "themes", "html_data", "types", "ui" ],
        "themes" : { "icons": false },
    });
    $('#fieldsTOC').bind('select_node.jstree', function (e, data) {
        $('#recordContainer span').each(function () { $(this).removeClass('highlight') });
        var obj = data.rslt.obj[0];
        while (typeof(obj) !== 'undefined' && !obj.hasAttribute('data-match')) {
            obj = obj.parentNode;
        }
        if (typeof(obj) !== 'undefined' && obj.hasAttribute('data-match')) {
            $('#recordContainer span[data-match="' + obj.getAttribute('data-match') + '"]').addClass('highlight');
            return false;
        }
    });
    $('#fieldsTOC').bind('deselect_node.jstree', function (e, data) {
        $('#recordContainer span').each(function () { $(this).removeClass('highlight') });
    });
}
