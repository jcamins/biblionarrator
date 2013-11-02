var expect = require('chai').expect,
    Environment = require('./lib/environment');

var backends = [ 'inproc', 'redis', 'mongo' ];

backends.forEach(function (backend) {
    var datastore, ignore;
    describe(backend, function () {
        before(function (done) {
            datastore = Environment({ dataconf: { backend: backend } }).datastore;
            datastore.connect().done(function (err) {
                done();
            }, function () {
                ignore = true;
                console.log("Skipping " + backend);
                done();
            });
        });
        it('saves and retrieves single key', function (done) {
            if (ignore) { done(); return; }
            datastore.set('testmodel', 'test1', { member1: 'stuff', member2: 'more stuff' });
            datastore.get('testmodel', 'test1', function (err, object) {
                expect(object).to.deep.equal({ member1: 'stuff', member2: 'more stuff' });
                done();
            });
        });
        it('retrieves all keys', function (done) {
            if (ignore) { done(); return; }
            datastore.set('testmodel', 'test2', { member1: 'other stuff', member3: 'different stuff' });
            datastore.get('testmodel', '*', function (err, object) {
                expect(object).to.deep.equal({ test1: { member1: 'stuff', member2: 'more stuff' }, test2: { member1: 'other stuff', member3: 'different stuff' } });
                done();
            });
        });
        it('deletes single key', function (done) {
            if (ignore) { done(); return; }
            datastore.del('testmodel', 'test1');
            datastore.get('testmodel', 'test1', function (err, object) {
                expect(err).to.equal(null);
                expect(object).to.equal(null);
                done();
            });
        });
        after(function (done) {
            if (ignore) { done(); return; }
            datastore.del('testmodel', 'test2');
            done();
        });
    });
});

