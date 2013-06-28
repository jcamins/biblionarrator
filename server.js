var express = require('express'),
    params = require('express-params'),
    cons = require('consolidate'),
    httpProxy = require('http-proxy'),
    proxy = new httpProxy.RoutingProxy(),
    routes = require('./routes');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('mustache', cons.mustache);
app.set('view engine', 'mustache');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
params.extend(app);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.param('id', /^\d+$/);
app.param('filename', /^[-_\w]+$/);

app.get('/css/fields.css', routes.assets.fieldscss);

app.get('/doc/:filename', routes.doc.get);

app.get('*', function (req, res) {
    return proxy.proxyRequest(req, res, {
        host: 'localhost',
        port: 3500
    });
});

exports.app = app;

