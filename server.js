	'use strict';

	var express = require('express'),
		path = require('path'),
		bodyParser = require('body-parser'),
		google = require('./routes/google'),
		moment = require('moment'),
		config = require('./config'),
		jwt = require('express-jwt'),
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
	app.use(bodyParser.json());

	var router = express.Router();
	app.use(router);


	router.get('/',function(req,res){
		res.status(200).json({message:'alive'});;
	});
	
	function renderList(req,res){
		res.render('list',{
			events:req.events,
			filterDate: function(){
				return function(text,render){
					return moment(render(text)).format('D/MM/YY');
				};
			},
			filterTime: function(){ 
				return function(text,render){
					return moment(render(text)).format('H:mm');	
				};
			}
		});
	}

	router.get('/list',authorize, google.authorize,google.getEvents, renderList);	
	router.get('/events/:date',authorize, google.authorize,google.getEvents,fieldbook.getEvents); 
	router.use('/event',authorize, google.authorize,fieldbook.checkEvent, google.checkEvent,fieldbook.addEvent);

	router.post('/event/checkin',authorize, fieldbook.checkIn, google.checkIn);
	router.post('/event/checkout',authorize, fieldbook.checkOut, google.checkOut);
	router.post('/event/skip',authorize, fieldbook.skip, google.skip);

	router.get('/', function(req,res){
		res.send('uovo');
	});

	if(require.main === module){
		app.listen(3000, function(){
			console.log('Listening on port 3000');
		});	
	}

	module.exports = app;

