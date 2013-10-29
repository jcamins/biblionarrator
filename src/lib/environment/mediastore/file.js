"use strict";
var crypto = require('crypto'),
    path = require('path'),
    fs = require('fs'),
    mv = require('mv');

function MediaStore(config) {
    var self = this;
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
}

module.exports = MediaStore;
