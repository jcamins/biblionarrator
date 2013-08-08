var querystring = require('querystring');

module.exports = Paginator;

function Paginator(offset, count, perpage, path, query) {
    var pages = Math.ceil(count / perpage);
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
        paginator.previous = {
            offset: query.offset,
            url: generateURL(path, query)
        };
    }
    for (var ii = 0; ii < pages; ii++) {
        query.offset = ii * perpage;
        paginator.page.push({
            offset: query.offset,
            label: ii + 1,
            current: ii * perpage === offset,
            url: generateURL(path, query)
        });
    }
    return paginator;
}

function generateURL(path, query) {
    return path + '?' + querystring.stringify(query);
}
