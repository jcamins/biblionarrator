var express = require('express'),
    cons = require('consolidate'),
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

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/css/fields.css', routes.assets.fieldscss);

app.listen(3000);

