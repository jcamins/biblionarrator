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
