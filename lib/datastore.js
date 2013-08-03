var mysql = require('mysql');

// Application initialization
var db_config = {
    host: 'localhost',
    user: 'biblionarrator',
    password: 'biblionarrator',
    database: 'bn_eric'
};

var pool = mysql.createPool(db_config);

exports.query = function (query, bindings, callback) {
    pool.getConnection(function (err, conn) {
        if (!err) {
            conn.query(query, bindings, function () {
                callback.apply(this, arguments);
                conn.end();
            });
        }
    });
};
