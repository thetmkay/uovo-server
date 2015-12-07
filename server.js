
	var express = require('express');

	var app = express();
	var router = express.Router();
	app.use(router);

	var google = require('./gapi.js');

	router.get('/auth/google',google.initMiddleware());

	router.get('/auth/google/callback', google.authMiddleware());

	router.get('/',function(req,res){
		res.send('home');
	});

	app.listen(3000, function(){
		console.log('Listening on port 3000');
	});	

	module.exports = app;

