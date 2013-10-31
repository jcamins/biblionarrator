"use strict";

function DataStore(config) {
    var backend = config.backend(config.dataconf.backend);
    this.wait = backend.wait;
    this.client = backend.client;
    this.data = backend.data;
    this.get = backend.get;
    this.set = backend.set;
    this.del = backend.del;
}

module.exports = DataStore;

