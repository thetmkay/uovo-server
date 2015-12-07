
	var express = require('express');

	var app = express();
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
			res.send('success');
		}, function(err){
			res.status(401).json(err);
		});
	});

	router.get('/',function(req,res){
		res.send('home');
	});
	
	router.get('/list', function(req,res){
		gapi.calendar.events().then(function(response){
			res.json(response);	
		}, function(err){
			res.status(err.status || 404).json(err);
		});
	});	

	app.listen(3000, function(){
		console.log('Listening on port 3000');
	});	

	module.exports = app;

