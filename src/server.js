var environment = require('./lib/environment'),
    express = require('express'),
    socketserver = require('./lib/socketserver'),
    handlebars = require('express-hbs'),
    flash = require('connect-flash'),
    http = require('http'),
    routes = require('./routes'),
    path = require('path'),
    auth = require('./lib/auth');

var app = express();
var RedisStore = require('connect-redis')(express);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.normalize(__dirname + '/../views'));
app.engine('handlebars', handlebars.express3({
        partialsDir: path.normalize(__dirname + '/../views/partials'),
        defaultLayout: path.normalize(__dirname + '/../views/layouts/main.handlebars')
    }));
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger({ format: environment.logs.accessformat || ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" (:response-time ms)', stream: environment.accesslog }));
app.use(express.bodyParser({ hash: 'sha1', keepExtensions: 'true', uploadDir: 'tmp' }));
app.use(express.methodOverride());
app.use(express.static(path.normalize(__dirname + '/../public')));
app.use('/views', express.static(path.normalize(__dirname + '/../views')));
app.use(express.cookieParser());
app.use(express.session({ 
    store: new RedisStore({
        client: environment.datastore.client()
    }),
    secret: 'biblionarrator'
}));
app.use(flash());
auth.initialize(app);
app.use(function(req, res, next) {
    app.locals({
        user: req.user,
        error: req.flash('error')
    });
    next();
});
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
