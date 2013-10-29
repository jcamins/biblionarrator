"use strict";
var crypto = require('crypto'),
    path = require('path'),
    fs = require('fs'),
    mv = require('mv');

function MediaStore(config) {
    var self = this;
    var base = path.resolve(__dirname, '../../../../', 'public/uploads');

    try {
        fs.mkdirSync(base);
    } catch (e) {
    }

    this.get = function (recordid, name, callback) {
        var shasum = crypto.createHash('sha1');
        shasum.update(recordid.toString(), 'utf8');
        fs.readFile(base + '/' + shasum.digest('hex') + '/' + name, callback);
    };

    this.save = function (recordid, name, metadata, tmppath, callback) {
        var shasum = crypto.createHash('sha1');
        shasum.update(recordid.toString(), 'utf8');
        var dir = shasum.digest('hex');
        mv(tmppath, base + '/' + dir + '/' + name, { mkdirp: true }, callback);
    };
}

module.exports = MediaStore;
