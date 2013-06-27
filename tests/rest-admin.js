var expect = require('chai').expect,
    request = require('superagent').agent(),
    host = 'http://localhost:4000';

describe('Authentication', function() {
    it('Can authenticate successfully', function(done) {
        request.post(host + '/user/login').type('form').send({
            username: 'tester@test.com',
            password: 'testme'
        }).end(function(res) {
            expect(res.text).to.contain('tester@test.com');
            done();
        });
    });
});

describe('Users', function() {
    testAdminTable('user', {
        aaData: {
            label: 'test user',
            callback: function (elem) {
                if (elem.name == 'Tester' && elem.email == 'tester@test.com') {
                    return true;
                }
            }
        }
    });

    var newUser;
    describe('adding', function () {
        it('should succeed', function(done) {
            testAddingResource('user', {
                data: {
                    name: 'Mr. Unit test man',
                    email: 'unittest@biblionarrator.com',
                    collection_id: 1
                },
                callback: function (res) {
                    newUser = res;
                }
            }, done);
        });
    });
    describe('reading', function () {
        it('should succeed', function(done) {
            testReadingResource('user', {
                data: {
                    id: newUser.id,
                },
                callback: function (res) {
                    //expect(res).to.equal(newUser);
                    // The above call will not work because Laravel returns
                    // different objects when creating a new model than when
                    // retrieving an existing model
                    expect(res.name).to.equal(newUser.name);
                    expect(res.email).to.equal(newUser.email);
                    expect(parseInt(res.id)).to.equal(newUser.id);
                }
            }, done);
        });
    });
    describe('updating', function () {
        it('should succeed', function(done) {
            testUpdatingResource('user', {
                data: {
                    id: newUser.id,
                    name: 'Ms. Unit test lady'
                },
                callback: function (res) {
                    expect(res.name).to.equal('Ms. Unit test lady');
                }
            }, done);
        });
    });
    describe('deleting', function () {
        it('should succeed', function(done) {
            testDeletingResource('user', {
                data: {
                    id: newUser.id
                }
            }, done);
        });
    });
});

function testAdminTable(resource_type, conf) {
    describe('table JSON iTotalRecords', function() {
        it('should be greater than zero', function(done) {
            request.get(host + '/resources/' + resource_type).set('Accept', 'application/json').end(function(res) {
                expect(res.body.iTotalRecords).to.be.above(0);
                done();
            });
        });
    });
    describe('table JSON aaData', function() {
        it('should contain ' + conf.aaData.label, function(done) {
            request.get(host + '/resources/' + resource_type).set('Accept', 'application/json').end(function(res) {
                var found = false;
                res.body.aaData.forEach(function(el, idx, arr) {
                    found = found || conf.aaData.callback(el);
                });
                if (!found) {
                    throw new Error('Could not find ' + conf.aaData.label);
                }
                done();
            });
        });
    });
}

function testAddingResource(resource_type, conf, done) {
    request.post(host + '/resources/' + resource_type).type('form').send(conf.data).set('Accept', 'application/json').end(function(res) {
        expect(res.body.id).to.exist;
        if (conf.callback) {
            conf.callback(res.body);
        }
        done();
    });
}

function testUpdatingResource(resource_type, conf, done) {
    request.post(host + '/resources/' + resource_type + '/' + conf.data.id).type('form').send(conf.data).set('Accept', 'application/json').end(function(res) {
        expect(res.body.id).to.exist;
        if (conf.callback) {
            conf.callback(res.body);
        }
        done();
    });
}

function testReadingResource(resource_type, conf, done) {
    request.get(host + '/resources/' + resource_type + '/' + conf.data.id).set('Accept', 'application/json').end(function(res) {
        expect(res.body.id).to.exist;
        if (conf.callback) {
            conf.callback(res.body);
        }
        done();
    });
}

function testDeletingResource(resource_type, conf, done) {
    request.del(host + '/resources/' + resource_type + '/' + conf.data.id).set('Accept', 'application/json').end(function(res) {
        expect(parseInt(res.body)).to.equal(conf.data.id);
        done();
    });
}
