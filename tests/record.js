var expect = require('chai').expect,
    models = require('../models'),
    Record = require('../models/record'),
    connection = require('../lib/datastore').connection;

describe('Record retrieved from database', function () {
    var wantid
    var rec;
    before(function (done) {
        connection.query('SELECT id FROM records LIMIT 1', function (err, results, fields) {
            wantid = results[0].id;
            rec = new Record(wantid);
            rec.with(function (val) {
                rec = val;
                done();
            });
        });
    });
    it('has desired id', function () {
        expect(rec.id).to.equal(wantid);
    });
    it('has data', function () {
        expect(rec.data).to.exist;
    });
});
