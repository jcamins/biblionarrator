function addBookmark(id) {
    $.ajax({
        type: "POST",
        url: "/bookmarks/add/" + id,
        dataType: "json",
    }).done(flashBookmark);
}

function deleteBookmark(id) {
    $.ajax({
        type: "POST",
        url: "/bookmarks/delete/" + id,
        dataType: "json",
    }).done(flashBookmark);
}

function flashBookmark(data) {
    if (parseInt(data.count) > 0) {
        $('.bookmark-count').each(function () { $(this).text(data.count); });
    } else {
        $('.bookmark-count').each(function () { $(this).empty(); });
    }
    if (typeof(data.message) !== 'undefined') {
        $('#bookmark-message').text(data.message);
        $('#bookmark-dropdown').fadeIn('slow', function() {
            setTimeout(function() {
                $('#bookmark-dropdown').fadeOut('slow');
            }, 2000);
        });
    }
}
