var mysql      = require('mysql');
 
// Application initialization


exports.connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'biblionarrator',
    password : 'biblionarrator',
    database : 'biblionarrator'
});

exports.connection.connect();
