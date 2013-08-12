var express = require('express'),
    socketserver = require('./lib/socketserver'),
    params = require('express-params'),
    handlebars = require('express-hbs'),
    http = require('http'),
    routes = require('./routes');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('handlebars', handlebars.express3({
        partialsDir: __dirname + '/views/partials',
        defaultLayout: __dirname + '/views/layouts/main.handlebars'
    }));
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({ hash: 'sha1', keepExtensions: 'true', uploadDir: 'tmp' }));
app.use(express.methodOverride());
app.use(express.static('public'));
app.use('/views', express.static(__dirname + '/views'));
app.use(app.router);
//params.extend(app);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

routes.init(app);

exports.app = app;

var httpserver;

exports.listen = function(port) {
    port = port || 3000;
    httpserver = http.createServer(app);
    socketserver.configure(httpserver);
    httpserver.listen(port);
};

exports.testhost = function() {
    return 'http://127.0.0.1:' + harness().address().port;
};

var harness = function() {
    httpserver = httpserver || app.listen(0);
    return httpserver;
};
