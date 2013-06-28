var expect = require('chai').expect,
    request = require('superagent').agent(),
    fs = require('fs'),
    marked = require('marked'),
    host = 'http://localhost:4000';


describe('install markdown document', function () {
    describe('content-type', function () {
        it('is text/html', function (done) {
            request.get(host + '/doc/install').end(function(res) {
                expect(res.type).to.equal('text/html');
                done();
            });
        });
    });
    describe('data', function () {
        it('matches source', function (done) {
            request.get(host + '/doc/install').end(function(res) {
                fs.readFile('doc/install.md', 'utf8', function (err, data) {
                    expect(res.text).to.equal(marked(data));
                    done();
                });
            });
        });
    });
});

describe('upgrades text document', function () {
    describe('content-type', function () {
        it('is text/plain', function (done) {
            request.get(host + '/doc/upgrades').end(function(res) {
                expect(res.type).to.equal('text/plain');
                done();
            });
        });
    });
    describe('data', function () {
        it('matches source', function (done) {
            request.get(host + '/doc/upgrades').end(function(res) {
                fs.readFile('doc/upgrades', 'utf8', function (err, data) {
                    expect(res.text).to.equal(data);
                    done();
                });
            });
        });
    });
});

describe('licensing html document', function () {
    describe('content-type', function () {
        it('is text/html', function (done) {
            request.get(host + '/doc/licensing').end(function(res) {
                expect(res.type).to.equal('text/html');
                done();
            });
        });
    });
    describe('data', function () {
        it('matches source', function (done) {
            request.get(host + '/doc/licensing').end(function(res) {
                fs.readFile('doc/licensing.html', 'utf8', function (err, data) {
                    expect(res.text).to.equal(data);
                    done();
                });
            });
        });
    });
});

