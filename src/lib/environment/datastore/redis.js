"use strict";
var redis = require('redis');

function DataStore(config) {
    var backend = config.backend('redis');
    this.wait = backend.wait;
    this.client = backend.client;
    this.get = backend.get;
    this.set = backend.set;
    this.del = backend.del;
}

module.exports = DataStore;
