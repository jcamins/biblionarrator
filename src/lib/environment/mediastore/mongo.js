"use strict";
var fs = require('fs'),
    mongodb = require('mongodb'),
    GridStore = mongodb.GridStore,
    MongoClient = mongodb.MongoClient,
    Q = require('q');

function MediaStore(config) {
    var backend = config.backend('mongo');
    this.send = backend.media.send;
    this.save = backend.media.save;
    this.del = backend.media.del;
}

module.exports = MediaStore;
