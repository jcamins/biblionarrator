(function( bookmarks, $, undefined ) {
    var showCount = function () {
        window.bndb.bookmarks(function (bookmarksdb) {
            bookmarksdb.count(function (num) {
                if (parseInt(num) > 0) {
                    $('.bookmark-count').each(function () { $(this).text(num); });
                } else {
                    $('.bookmark-count').each(function () { $(this).empty(); });
                }
            });
        });
    };

    var flashBookmark = function (message) {
        if (typeof(message) !== 'undefined') {
            $('#bookmark-message').text(message);
            $('#bookmark-dropdown').fadeIn('slow', function() {
                setTimeout(function() {
                    $('#bookmark-dropdown').fadeOut('slow');
                }, 2000);
            });
        }
    };

    bookmarks.add = function (id) {
        window.bndb.bookmarks(function (bookmarksdb) {
            bookmarksdb.get(id).done(function (rec) {
                if (rec) {
                    flashBookmark('This item was already in your bookmarks');
                } else {
                    $.ajax({
                        url: "/record/" + id,
                        accept: { json: 'application/json' },
                        dataType: 'json'
                    }).done(function (data) {
                        window.bndb.bookmarks(function(bookmarksdb) {
                            var promise = bookmarksdb.add(data);
                            promise.then(function () {
                                flashBookmark('This item has been added to your bookmarks');
                                showCount();
                            }, function (err, event) {
                                flashBookmark('There was an error adding this item to your bookmarks');
                            });
                        });
                    });
                }
            });
        });
    };

    bookmarks.show = function() {
        var data = { records: [] }
        window.bndb.bookmarks(function(bookmarksdb) {
            bookmarksdb.each(function (bookmark) {
                bookmark.value.rendered = window.formatter.render(JSON.parse(bookmark.value.data));
                data.records.push(bookmark.value);
            }).done(function () {
                var mountpoint = document.createElement('div');
                data.count = data.total = data.records.length;
                window.renderer.render(data, 'results', mountpoint);
                $(mountpoint).on('rendered', function () {
                    $('#controlbar .nav').empty();
                    var cb = $(mountpoint).find('#contentFor-controlbar');
                    $(cb).appendTo($('#controlbar .nav'));
                    $(cb).removeAttr('id');
                    $('.leftPane').empty();
                    $(mountpoint).appendTo('.leftPane');
                });
            });
        });
    };

    bookmarks.remove = function(id) {
        window.bndb.bookmarks(function (bookmarksdb) {
            bookmarksdb.delete(id).done(function () {
                flashBookmark('This item has been removed from your bookmarks');
                showCount();
            }, function (err) {
            });
        });
    };

}( window.bookmarks = window.bookmarks || {}, jQuery ));

$(document).ready(function () {
    $('.show-bookmarks').click(function () {
        window.bookmarks.show();
        History.pushState({ 'event' : 'bookmarks' }, 'Bookmarks', '/bookmarks');
    });
});
