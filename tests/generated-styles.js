var expect = require('chai').expect,
    request = require('superagent').agent(),
    PrettyCSS = require('PrettyCSS'),
    host = 'http://localhost:4000';


describe('fields.css', function () {
    it('valid CSS', function (done) {
        request.get(host + '/css/fields.css').end(function(res) {
            expect(PrettyCSS.parse(res.text).errors.length).to.equal(0);
            done();
        });
    });
});
