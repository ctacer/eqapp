
/**
 * Module dependencies.
 */

global = {};
global.__dirname = __dirname;
global.config = require('./config/server_config.js').configurate();

var express = require('express');

global.routes = {};
global.routes.indexRoute = require('./routes');
global.routes.user = require('./routes/user');

global.modules = {};
global.modules.http = require('http');
global.modules.path = require('path');

var app = express();
global.app = app;

// all environments
app.set('port', global.config.server.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(global.modules.path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', global.routes.indexRoute.index);
app.get('/music', global.routes.indexRoute.music);

global.modules.http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
