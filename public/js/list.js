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
        window.bnpanes.next('/record/' + $(row).attr('data-id') + '/links', row);
    });
}

/* The built-in caching from the web browser will almost certainly be sufficient,
   but implementing our own history/garbage collection is useful for tracking
   what the system is doing while we're trying to refactor search panes. */
(function( bnpanes, $, undefined ) {
    var panes = { };
    var current;
    var previous = [ ];
    var next = [ ];
    var history = [ ];
    
    bnpanes.historysize = 4;
    bnpanes.viewportwidth = 2;
    
    bnpanes.previous = function (url, reference) {
        if (url) {
            previous = bnpanes.gc(previous, 0);
        } else {
            url = previous.shift;
        }
        me.load(url);
    };
        
    bnpanes.next = function (url, reference) {
        if (url) {
            next = bnpanes.gc(next, 0);
        } else {
            url = next.shift;
        }
        bnpanes.load(url, function (data) {
            if ($(reference).parents('.leftPane').length > 0) {
                $('tr.browsing').removeClass('browsing');
                $('.rightPane').remove();
            } else {
                window.scrollTo(0, 0);
                $('.leftPane').remove();
                $('.rightPane').removeClass('rightPane').addClass('leftPane').css('margin-top', '0');
            }
            $(reference).addClass('browsing');
            $('.search-scroller').append('<div class="rightPane" style="margin-top: ' + $(window).scrollTop() + 'px">' + data + '</div>');
        });
    };
    
    bnpanes.load = function (url, render) {
        if (panes[url]) {
            render(panes[url]);
        } else {
            $.ajax({
                url: url,
                success: function (data) {
                    panes[url] = data;
                    history.unshift(url);
                    bnpanes.gc();
                    render(data);
                },
                failure: function (data) {
                }
            });
        }
    };
    
    bnpanes.gc = function (list, length) {
        list = list || history;
        length = length || bnpanes.historysize;
        var url;
        while (list.length > length) {
            url = list.pop();
            delete panes[url];
        }
        return list;
    };
}( window.bnpanes = window.bnpanes || {}, jQuery ));
