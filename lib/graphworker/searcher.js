var graphstore = require('../graphstore'),
    g = graphstore();

module.exports = function (input) {
    var records;
    var count = new g.HashMap();
    var list = new g.ArrayList();
    if (typeof input.query === 'object' || input.query.length === 0) {
        input.query = input.query || null;
        records = g.V(input.query).as('me').groupCount(count, "{'_'}").back('me').aggregate(list).range(input.offset, input.offset + input.perpage - 1).toJSON();
    } else {
        records = graphstore.textSearch(input.query).as('me').groupCount(count, "{'_'}").back('me').aggregate(list).range(input.offset, input.offset + input.perpage - 1).toJSON();
    }
    return {
        records: records,
        count: count.toJSON()['_'],
        list: list.toJSON()
    };
};
