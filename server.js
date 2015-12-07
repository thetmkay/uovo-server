
	var express = require('express');

	var google = require('googleapis');
	var gcal = google.calendar('v3');
	var passport = require('passport');
	var session = require('express-session');
	var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

	var config = require('./config');

	const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly', 'email', 'profile'];
	const REDIRECT_URL = 'http://localhost:3000/auth/google/callback';
	
	passport.use(new GoogleStrategy({
		clientID:config.google.id,
		clientSecret:config.google.secret,
		callbackURL:REDIRECT_URL,
		scope: SCOPES
	}, function(accessToken, refreshToken, profile, done){
		console.log('authenticated');
		return done(null, profile);
	}));

	passport.serializeUser(function(user,done){
		return done(null,user);
	});

	passport.deserializeUser(function(obj,done){
		return done(null,obj);
	});

	var app = express();
	app.use(session({secret: config.session.secret, resave: false, saveUninitialized: false}));
	app.use(passport.initialize());
	app.use(passport.session());
	var router = express.Router();
	app.use(router);

	function ensureAuthenticated(req,res,next){
		if(req.isAuthenticated()){
			next();
		} else{
			res.redirect('/auth/google');
		}
	}

	router.get('/auth/google',
	 passport.authenticate('google'),
	 function(req, res){
	   // The request will be redirected to Google for authentication, so this
	   // function will not be called.
	 });

	router.get('/auth/google/callback', passport.authenticate('google', {}), function(req,res){
		res.redirect('/');
	//	res.send('success');
	});

	router.get('/',ensureAuthenticated,function(req,res){
		console.log(Object.keys(req));
		console.log(Object.keys(req.user));
		console.log(Object.keys(req.session));
		console.log(Object.keys(req.connection));
		gcal.calendarList.list({}, function(results){
			console.log(results);
		});
		
		res.send('home');
	});

	

	module.exports = app;

