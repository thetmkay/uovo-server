	'use strict';

	var express = require('express'),
		path = require('path'),
		bodyParser = require('body-parser'),
		google = require('./routes/google'),
		notification = require('./routes/notification'),
		couch = require('./routes/couch'),
		moment = require('moment'),
		config = require('./config'),
		jwt = require('express-jwt'),
		proxy = require('express-http-proxy'),
		fieldbook = require('./routes/fieldbook');

	var app = express();
	
	var authorize = jwt({
	  secret: new Buffer(config.auth0.secret, 'base64'),
	  audience: config.auth0.audience
	});

	app.engine('mustache', require('mustache-express')());
	app.set('view engine', 'mustache');
	app.set('views', path.join(__dirname, 'views'));
	app.use(express.static(path.join(__dirname,'public')));
	app.use('/couch',authorize,proxy('127.0.0.1:5984', {
		forwardPath: function(req, res) {
 		   return require('url').parse(req.url).path;
  		}
	}));
	app.use(bodyParser.json());	
	
	var router = express.Router();

	app.use(router);

	router.get('/',function(req,res){
		res.status(200).json({message:'alive'});;
	});

	router.get('/watch',google.authorize, notification.createPush)
	
	router.post('/google/notification', google.authorize, google.getChanges, couch.updateEvents);
	router.get('/update', authorize, google.authorize, google.getChanges, couch.updateEvents);	
	router.get('/events/:date', authorize, couch.getEvents)
	router.use('/event', authorize)
	router.post('/event/checkin',couch.checkIn);
	router.post('/event/checkout',couch.checkOut);
	router.post('/event/skip',couch.skip);

	router.get('/', function(req,res){
		res.send('uovo');
	});

	if(require.main === module){
		app.listen(3000, function(){
			console.log('Listening on port 3000');
		});	
	}

	module.exports = app;

