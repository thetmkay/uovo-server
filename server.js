
	var express = require('express');

	var app = express();
	var router = express.Router();
	app.use(router);

	var gauth  = require('./gauth.js');
	var gapi = require('./gapi.js');
	
	const REDIRECT_URL = 'http://localhost:3000/auth/google/callback';

	router.get('/auth/google',gauth.initMiddleware(REDIRECT_URL));

	router.get('/auth/google/callback', gauth.authMiddleware(gapi));

	router.get('/',function(req,res){
		res.send('home');
	});

	app.listen(3000, function(){
		console.log('Listening on port 3000');
	});	

	module.exports = app;

