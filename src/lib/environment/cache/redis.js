"use strict";
var redis = require('redis');

function Cache(config) {
    var backend = config.backend('redis');
    backend.cache.init();
    this.mget = this.get = backend.cache.get;
    this.set = backend.cache.set;
}

module.exports = Cache;
