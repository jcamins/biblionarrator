"use strict";

function DataStore(config) {
    var backend = config.backend('mongo');
    this.wait = backend.wait;
    this.database = backend.database;
    this.get = backend.get;
    this.set = backend.set;
    this.del = backend.del;
}

module.exports = DataStore;

