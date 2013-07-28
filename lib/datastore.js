var mysql = require('mysql');

// Application initialization
var db_config = {
    host: 'localhost',
    user: 'biblionarrator',
    password: 'biblionarrator',
    database: 'bn_eric'
};

var conn = mysql.createConnection(db_config);

conn.connect();

reconnect = function(err) {
    console.log(err.code,'Trying to connect in 5 secs'+new Date());
    setTimeout(function (){
        conn = mysql.createConnection(db_config);
        conn.on('error',reconnect);
        conn.connect();
    },5000);
};
conn.on('error',reconnect);

exports.query = function (query, bindings, callback) {
    return conn.query(query, bindings, callback);
};
