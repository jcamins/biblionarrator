var landmarks = [ ];

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
    $('.remove-facet').click(function(ev) {
        var self = this;
        var parts = document.URL.split(/[?&]/);
        var url = parts[0];
        var facetidx = 0;
        parts.slice(1).forEach(function (part, index) {
            if (part.substring(0, 5) === 'facet') {
                if (facetidx === parseInt($(self).attr('data-index'), 10)) {
                    part = '';
                } else {
                    facetidx++;
                }
            }
            if (part.length > 0) {
                url += (index > 0 ? '&' : '?') + part;
            }
        });
        window.location.href = url;
        ev.preventDefault();
    });
    $('.add-bookmark').click(function() {
        addBookmark($(this).parents('tr').attr('data-id'));
        return false;
    });
    $('body').on('click', '.explore-links', null, function() {
        var row = $(this).parents('tr');
        window.bnpanes.load('/search?q=' + encodeURIComponent('{{linkbrowse:' + $(row).attr('data-id') + '}}'));
    });
    $('body').on('click', '.mark-landmark:not(.selected)', null, function () {
        var row = $(this).parents('tr');
        landmarks.push($(row).attr('data-id'));
        $(this).addClass('selected');
    });
    $('body').on('click', '.mark-landmark.selected', null, function () {
        var row = $(this).parents('tr');
        for (var ii = 0; ii < landmarks.length; ii++) {
            if (landmarks[ii] === $(row).attr('data-id')) {
                landmarks.splice(ii, 1);
                break;
            }
        }
        $(this).removeClass('selected');
    });

    $('#visualize-landmarks').click(function () {
        if ($(this).hasClass('active')) {
            $('#visualization-container, .visualization-key').hide();
            $(this).removeClass('active');
        } else {
            $('#visualization-container').show();
            window.bnvis.landmarks(landmarks);
            $(this).addClass('active');
        }
    });

    $('#visualize-search').click(function () {
        if ($(this).hasClass('active')) {
            $('#visualization-container, .visualization-key').hide();
            $(this).removeClass('active');
        } else {
            $('#visualization-container').show();
            window.bnvis.searchmap(window.location.href);
            $(this).addClass('active');
        }
    });


    $('body').on('click', '.collapsed', null, function () {
        window.bnpanes.select($(this).attr('data-pane'));
    });

    $('body').on('click', 'a[data-href]', null, function (ev) {
        ev.preventDefault();
        var parts = [ $(this).attr('data-href') ];
        $(this).parents('[data-href]').each(function () {
            parts.push($(this).attr('data-href'));
        });
        parts = parts.reverse();
        var href = parts[0];
        for (var ii = 1; ii < parts.length; ii++) {
            if (parts[ii].indexOf('&') === 0 && href.indexOf('?') === -1) {
                href = href + '?';
            }
            href = href + parts[ii];
        }
        window.location.href = href;
    });

    $('body').on('click', '[data-target="pane"]', null, function (ev) {
        window.bnpanes.load($(this).attr('href'), $(this).closest('.pane').attr('data-pane'));
        ev.preventDefault();
    });

    $('#showmore a').click(function (ev) {
        ev.preventDefault();
        var a = this;
        var offset = parseInt($(a).attr('data-offset'), 10);
        $.ajax({
            url: $(a).attr('href'),
            accept: { json: 'application/json' },
            dataType: 'json',
            data: {
                offset: $(a).attr('data-offset')
            }
        }).done(function (data) {
            $(a).attr('data-offset', offset + 20);
            window.renderer.render(data, 'resultstable', function (newrows) {
                $('#showmore').before(newrows);
                History.pushState({ 'event' : 'search' }, 'Search', $(a).attr('href') + '&perpage=' + (offset + 20) + '#result' + (offset + 1));
            });
        });
    });

    /*$('body').on('click', '.facet-list a', null, function () {
        if ($(this).attr('href') === '#all') {
            $('.resultRow').show();
        } else {
            $('.resultRow').hide();
            $('.resultRow[data-facet="' + $(this).attr('href') + '"]').show();
        }
    });*/
}

/* The built-in caching from the web browser will almost certainly be sufficient,
   but implementing our own history/garbage collection is useful for tracking
   what the system is doing while we're trying to refactor search panes. */
(function( bnpanes, $, undefined ) {
    var panes = [ { url: window.location.href, node: document.querySelector('.pane') } ];
    var current = 0;

    document.querySelector('.pane').setAttribute('data-pane', '0');
    
    bnpanes.select = function (newidx) {
        if (typeof newidx !== 'undefined' && panes.length > 0) {
            newidx = parseInt(newidx, 10);
            var idx;
            for (idx = 0; idx < newidx; idx++) {
                panes[idx].node.className = 'pane collapsed collapsed-left';
                document.getElementById('search-scroller').appendChild(panes[idx].node);
            }
            for (idx = panes.length - 1; idx > newidx; idx--) {
                panes[idx].node.className = 'pane collapsed collapsed-right';
                document.getElementById('search-scroller').appendChild(panes[idx].node);
            }
            panes[newidx].node.className = 'pane';
            document.getElementById('search-scroller').appendChild(panes[newidx].node);
            History.pushState({ 'pane': newidx }, '', panes[newidx].url);
            current = newidx;
        }
    };
    
    bnpanes.load = function (url, index) {
        if (typeof current !== 'undefined' && !(typeof index !== 'undefined' && panes[index])) {
            for (var idx = current + 1; idx < panes.length; idx++) {
                panes[idx].node.parentNode.removeChild(panes[idx].node);
            }
            panes = panes.slice(0, current + 1);
        }
        $.ajax({
            url: url,
            data: { layout: 'none' },
            success: function (data) {
                var node = document.createElement('div');
                node.className = 'pane';
                node.innerHTML = data;
                if (typeof index !== 'undefined' && panes[index]) {
                    node.setAttribute('data-pane', index);
                    panes[index].node.parentNode.removeChild(panes[index].node);
                    panes[index] = { url: url, node: node };
                } else {
                    node.setAttribute('data-pane', panes.length);
                    panes.push({ url: url, node: node });
                    index = panes.length - 1;
                }
                //rewriteResults(node);
                bnpanes.select(index);
                registerSubscriptions();
                applyChrome();
            },
            failure: function (data) {
            }
        });
    };
}( window.bnpanes = window.bnpanes || {}, jQuery ));
