var querystring = require('querystring');

module.exports = Paginator;

function Paginator(offset, count, perpage, path, query) {
    var pages = Math.ceil(count / perpage);
    var current = Math.floor(offset / perpage);
    var paginator = {
        page: [ ],
        offset: offset,
        perpage: perpage,
    };
    if (offset > 0) {
        query.offset = Math.max(offset - perpage, 0);
        paginator.previous = {
            offset: query.offset,
            url: generateURL(path, query)
        };
    }
    if (offset + perpage < count) {
        query.offset = Math.min(offset + perpage, count - 1);
        paginator.next = {
            offset: query.offset,
            url: generateURL(path, query)
        };
    }
    var ii;
    if (pages <= 10) {
        for (ii = 0; ii < pages; ii++) {
            paginator.page.push(makePage(ii, perpage, current, path, query));
        }
    } else {
        for (ii = 0; ii < 2; ii++) {
            paginator.page.push(makePage(ii, perpage, current, path, query));
        }
        if (current - 3 > 2) {
            paginator.page.push({ ellipsis: true });
        }
        var windowtop = Math.min(current + 3, pages - 2);
        for (ii = Math.max(2, current - 3); ii < windowtop; ii++) {
            paginator.page.push(makePage(ii, perpage, current, path, query));
        }
        if (windowtop < pages - 2) {
            paginator.page.push({ ellipsis: true });
        }
        for (ii = pages - 2; ii < pages; ii++) {
            paginator.page.push(makePage(ii, perpage, current, path, query));
        }
    }
    return paginator;
}

function makePage(num, perpage, current, path, query) {
    query.offset = num * perpage;
    return {
        offset: query.offset,
        label: num + 1,
        current: num === current,
        url: generateURL(path, query)
    };
}

function generateURL(path, query) {
    return path + '?' + querystring.stringify(query);
}
