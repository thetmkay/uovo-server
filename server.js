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


	router.get('/',function(req,res){
		res.status(200).json({message:'alive'});;
	});
	
	router.get('/list', google.authorize,google.list);	
	router.get('/events/:date',google.authorize,google.getEvents,fieldbook.getEvents); 
	router.use('/event',google.authorize,fieldbook.checkEvent, google.checkEvent,fieldbook.addEvent);

	router.post('/event/checkin', fieldbook.checkIn, google.checkIn);
	router.post('/event/checkout', fieldbook.checkOut, google.checkOut);
	router.post('/event/skip', fieldbook.skip, google.skip);

	if(require.main === module){
		app.listen(3000, function(){
			console.log('Listening on port 3000');
		});	
	}

	module.exports = app;

