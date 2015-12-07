module.exports = (function(){
	var url = require('url');
	var google = require('googleapis');
	var gcal = google.calendar('v3');
	var OAuth2 = google.auth.OAuth2;
	var oauth2Client;


	var config = require('./config');

	const SCOPES = ['https://www.googleapis.com/auth/calendar', 'email', 'profile'];

	function getAuthUrl(redirect_url){
		return new Promise(function(resolve,reject){	
			oauth2Client = new OAuth2(config.google.id, config.google.secret, redirect_url); 

			var authUrl = oauth2Client.generateAuthUrl({
				access_type:'offline',
				scope: SCOPES
			});
			resolve(authUrl);
		});
	}

	function getAuthClient(code){
		return new Promise(function(resolve,reject){
			oauth2Client.getToken(code, function(err,tokens){
				if(err){
					return reject(err);
				}
				oauth2Client.setCredentials(tokens);
				resolve(oauth2Client);
			})	
		});
	}


	return {
		getAuthUrl: getAuthUrl,
		getAuthClient: getAuthClient
	};	
})();


