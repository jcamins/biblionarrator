var expect = require('chai').expect,
    models = require('../models'),
    Record = require('../models/record'),
    datastore = require('../lib/datastore');

describe('Record retrieved from database', function () {
    var wantid;
    var rec;
    before(function (done) {
        datastore.query('SELECT id FROM records LIMIT 1', function (err, results, fields) {
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
        expect(rec.data).to.not.equal(null);
    });
});
