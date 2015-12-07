
	var express = require('express'),
		path = require('path'),
		moment = require('moment');

	var app = express();

	app.engine('mustache', require('mustache-express')());
	app.set('view engine', 'mustache');
	app.set('views', path.join(__dirname, 'views'));

	var router = express.Router();
	app.use(router);

	var gauth  = require('./gauth.js');
	var gapi = require('./gapi.js');
	
	const REDIRECT_URL = 'http://localhost:3000/auth/google/callback';

	router.get('/auth/google',function(req,res){
		gauth.getAuthUrl(REDIRECT_URL).then(function(url){
			res.redirect(url);
		},function(err){
			res.status(err.status || 404).json(err);
		});
	});

	router.get('/auth/google/callback',function(req,res){
		var code = req.query.code;
		if(!code){
			return res.status(404).json({
				status: 404,
				message: 'Code not returned from google'
			});
		}
		gauth.getAuthClient(code).then(function(client){
			gapi.options({auth:client});
			res.redirect('/list');
		}, function(err){
			res.status(401).json(err);
		});
	});

	router.get('/',function(req,res){
		res.send('home');
	});
	
	router.get('/list', function(req,res){
		gapi.calendar.events().then(function(response){

			var events = response.items.map(function(ev){
				return  {
					name: ev.summary,
					date: moment(ev.start.dateTime).format('D/M/YY'),
					startTime:moment(ev.start.dateTime).format('H:m'),
					endTime:moment(ev.end.dateTime).format('H:m')
				}
			});

			console.log(events);
			res.render('list',{ events: events});

		}, function(err){
			res.status(err.status || 404).json(err);
		});
	});	

	app.listen(3000, function(){
		console.log('Listening on port 3000');
	});	

	module.exports = app;

