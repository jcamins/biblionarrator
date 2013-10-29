"use strict";
var path = require('path'),
    fs = require('fs'),
    mv = require('mv');

function MediaStore(config) {
    var base = path.resolve(config.mediaconf.path);

    this.get = function (recordid, name, callback) {
        fs.readFile(base + '/' + recordid + '/' + name, callback);
    };

    this.send = function (recordid, name, res) {
        res.sendfile(base + '/' + recordid + '/' + name);
    };

    this.save = function (recordid, name, metadata, tmppath, callback) {
        mv(tmppath, base + '/' + recordid + '/' + name, { mkdirp: true }, callback);
    };

    this.del = function (recordid, name, callback) {
        fs.unlink(base + '/' + recordid + '/' + name, callback);
    };
}

module.exports = MediaStore;
