var redis = require("redis"),
    client = redis.createClient();

module.exports.get = function (key, callback) {
    client.get(key, function (err, value) {
        value = JSON.parse(value);
        callback(err, value);
    });
};

module.exports.set = function (key, value, expiration, callback) {
    value = JSON.stringify(value);
    client.set(key, value, function (err, reply) {
        if (expiration > 0) {
            client.expire(key, expiration);
        }
        if (typeof callback === 'function') {
            callback(err, reply);
        }
    });
};

module.exports.del = function (key, callback) {
};
