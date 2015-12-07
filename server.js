	'use strict';

	var express = require('express'),
		path = require('path'),
		bodyParser = require('body-parser'),
		google = require('./routes/google'),
		fieldbook = require('./routes/fieldbook');

	var app = express();

	app.engine('mustache', require('mustache-express')());
	app.set('view engine', 'mustache');
	app.set('views', path.join(__dirname, 'views'));
	app.use(express.static(path.join(__dirname,'public')));
	app.use(bodyParser.json());

	var router = express.Router();
	app.use(router);


	router.get('/auth/google',google.auth);

	router.get('/auth/google/callback',google.callback);

	router.get('/',function(req,res){
		res.send('home');
	});
	
	router.get('/list', google.events);	

	router.use('/event',fieldbook.checkEvent, google.checkEvent,fieldbook.addEvent);

	router.post('/event/checkin', fieldbook.checkIn);
	router.post('/event/checkout', fieldbook.checkOut);
	router.post('/event/skip', fieldbook.skip);

	app.listen(3000, function(){
		console.log('Listening on port 3000');
	});	

	module.exports = app;

