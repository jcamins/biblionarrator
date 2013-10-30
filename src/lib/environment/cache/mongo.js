"use strict";

function Cache(config) {
    var backend = config.backend('mongo');
    backend.cache.init();
    this.mget = this.get = backend.cache.get;
    this.set = backend.cache.set;
}

module.exports = Cache;

