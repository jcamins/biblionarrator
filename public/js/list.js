function initializeList() {
    $('body').on('click', '.preview', null, function() {
        var button = this;
        if ($(button).hasClass('open')) {
            $(button).parents('td').find('section').each(function () {
                $(this).slideUp('fast', function () {
                    $(button).removeClass('open');
                });
            });
        } else {
            $(button).parents('td').find('section').each(function () {
                $(this).slideDown('fast', function () {
                    $(button).addClass('open');
                });
            });
        }
    });
    $('#sortings').on('change', '#add-sort', null, function() {
        if ($(this).find(':selected').val()) {
            window.location.href = addQueryStringParameter(document.URL, 'sort[]', $(this).find(':selected').val());
        }
    });
    $('#perpage').change(function () {
        window.location.href = updateQueryStringParameter(document.URL, 'perpage', $(this).find(':selected').val());
    });
    $('.add-bookmark').click(function() {
        addBookmark($(this).parents('tr').attr('data-id'));
        return false;
    });
    $('body').on('click', '.explore-links', null, function() {
        var row = $(this).parents('tr');
        $.ajax({
            url: '/record/' + $(row).attr('data-id') + '/links'
        }).done(function (data) {
            if ($(row).parents('.leftPane').length > 0) {
                $('tr.browsing').removeClass('browsing');
                $('.rightPane').remove();
            } else {
                window.scrollTo(0, 0);
                $('.leftPane').remove();
                $('.rightPane').removeClass('rightPane').addClass('leftPane').css('margin-top', '0');
            }
            $(row).addClass('browsing');
            $('.search-scroller').append('<div class="rightPane" style="margin-top: ' + $(window).scrollTop() + 'px">' + data + '</div>');
        });
    });
}
