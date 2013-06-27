var chai = require('chai'),
    request = require('superagent').agent(),
    host = 'http://localhost:4000';
chai.should();

describe('Authentication', function() {
    it('Can authenticate successfully', function(done) {
        request.post(host + '/user/login').type('form').send({
            username: 'tester@test.com',
            password: 'testme'
        }).end(function(res) {
            res.text.should.contain('tester@test.com');
            done();
        });
    });
});

describe('Users', function() {
    testAdminTable({
        aaData: {
            label: 'test user',
            data: {
                name: 'Tester',
                email: 'tester@test.com'
            }
        }
    });
});

function testAdminTable(conf) {
    describe('table JSON iTotalRecords', function() {
        it('should be greater than zero', function(done) {
            request.get(host + '/resources/user').set('Accept', 'application/json').end(function(res) {
                res.body.iTotalRecords.should.be.above(0);
                done();
            });
        });
    });
    describe('table JSON aaData', function() {
        it('should contain ' + conf.aaData.label, function(done) {
            request.get(host + '/resources/user').set('Accept', 'application/json').end(function(res) {
                var found = false;
                res.body.aaData.forEach(function(el, idx, arr) {
                    var match = true;
                    Object.keys(conf.aaData.data).forEach(function(key) {
                        if (el[key] != conf.aaData.data[key]) {
                            match = false;
                        }
                    });
                    if (match) {
                        found = true;
                    }
                });
                if (!found) {
                    throw new Error('Could not find ' + conf.aaData.label);
                }
                done();
            });
        });
    });
}
