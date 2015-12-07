module.exports = (function(){
	var url = require('url');
	var google = require('googleapis');
	var gcal = google.calendar('v3');
	var OAuth2 = google.auth.OAuth2;
	var oauth2Client;


	var config = require('./config');

	const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly', 'email', 'profile'];

	function initMiddleware(redirect_url){
		return function(req,res,next){	
			oauth2Client = new OAuth2(config.google.id, config.google.secret, redirect_url); 

			var authUrl = oauth2Client.generateAuthUrl({
				access_type:'offline',
				scope: SCOPES
			});
			
			res.redirect(authUrl);
		}
	}

	function authMiddleware(gapi){
		return function(req,res,next){
			var code = req.query.code;
			if(!code){
				return res.status(404).json({
					status: 404,
					message: 'Code not returned from google'
				});
			}
			oauth2Client.getToken(code, function(err,tokens){
				if(err){
					return res.status(401).json(err);
				}
				oauth2Client.setCredentials(tokens);
				gapi.options({auth: oauth2Client});
				
				res.send('success');
			})	
		}
	}


	return {
		authMiddleware: authMiddleware,
		initMiddleware: initMiddleware
	};	
})();


