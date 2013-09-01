var expect = require('chai').expect,
    request = require('superagent').agent(),
    PrettyCSS = require('PrettyCSS'),
    jshint = require('jshint').JSHINT,
    testhost = require('../server').testhost();


describe('fields.css', function() {
    var res;
    before(function (done) {
        request.get(testhost + '/css/fields.css').end(function(r) {
            res = r;
            done();
        });
    });
    it('has text/css content-type', function() {
        expect(res.type).to.equal('text/css');
    });

    it('is valid CSS', function() {
        expect(PrettyCSS.parse(res.text).errors.length).to.equal(0);
    });
});

/*describe('svc/bndb_initializer', function() {
    var res;
    before(function (done) {
        request.get(testhost + '/svc/bndb_initializer.js').end(function(r) {
            res = r;
            done();
        });
    });
    it('has text/javascript content-type', function() {
        expect(res.type).to.equal('text/javascript');
    });

    it('valid JS', function() {
        expect(jshint(res.text)).to.equal(true);
    });
});*/
