var expect = require('chai').expect,
    request = require('superagent').agent(),
    PrettyCSS = require('PrettyCSS'),
    jshint = require('jshint').JSHINT,
    testhost = require('../server').testhost();


describe('fields.css', function () {
    it('has text/css content-type', function (done) {
        request.get(testhost + '/css/fields.css').end(function(res) {
            expect(res.type).to.equal('text/css');
            done();
        });
    });

    it('is valid CSS', function (done) {
        request.get(testhost + '/css/fields.css').end(function(res) {
            expect(PrettyCSS.parse(res.text).errors.length).to.equal(0);
            done();
        });
    });
});

describe('svc/bndb_initializer', function () {
    it('has text/javascript content-type', function (done) {
        request.get(testhost + '/svc/bndb_initializer.js').end(function(res) {
            expect(res.type).to.equal('text/javascript');
            done();
        });
    });

    it('valid JS', function (done) {
        request.get(testhost + '/svc/bndb_initializer.js').end(function(res) {
            expect(jshint(res.text)).to.equal(true);
            done();
        });
    });
});

