
/**
 * Module dependencies.
 */

global = {};
global.__dirname = __dirname;
global.config = require('./config/server_config.js').configurate();

var express = require('express');

global.routes = {};
global.routes.indexRoute = require('./routes');

global.modules = {};
global.modules.http = require('http');
global.modules.path = require('path');
global.modules.bodyParser = require('body-parser');

var app = express();
global.app = app;

// all environments
app.set('port', global.config.server.port);
app.set('views', __dirname + '/views');
app.use(global.modules.bodyParser.json());
app.use(express.static(global.modules.path.join(__dirname, 'public')));
// app.use('/resources', express.static(__dirname + '/resources'));
app.use('/resources', express.static(global.config.resources.dir));

app.get('/music', global.routes.indexRoute.music);
app.get('/music/v2', global.routes.indexRoute.resources);

global.modules.http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});