"use strict";
var path = require('path'),
    fs = require('fs'),
    mv = require('mv');

function MediaStore(config) {
    if (config.dataconf.backend === 'file') {
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
    } else {
        var backend = config.backend('mongo');
        this.send = backend.media.send;
        this.save = backend.media.save;
        this.del = backend.media.del;
    }
}

module.exports = MediaStore;

