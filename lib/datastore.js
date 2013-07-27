var mysql = require('mysql');

// Application initialization
var db_config = {
    host: 'localhost',
    user: 'biblionarrator',
    password: 'biblionarrator',
    database: 'biblionarrator'
};

exports.connection = mysql.createConnection(db_config);

exports.connection.connect();

reconnect = function(err) {
    console.log(err.code,'Trying to connect in 5 secs'+new Date());
    setTimeout(function (){
        exports.connection = mysql.createConnection(db_config);
        exports.connection.on('error',reconnect);
        exports.connection.connect();
    },5000);
};
exports.connection.on('error',reconnect);
