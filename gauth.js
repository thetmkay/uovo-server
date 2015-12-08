module.exports = (function(){
	var url = require('url');
	var google = require('googleapis');
	var gcal;

	var config = require('./config');
	var serviceConfig = require('./google-service');

	const SCOPES = ['https://www.googleapis.com/auth/calendar'];

	var serviceAuth = new google.auth.JWT(serviceConfig.client_email,null,serviceConfig.private_key, SCOPES);



	return {
		authorize: 	function authorize(){
			return new Promise(function(resolve,reject){
				serviceAuth.authorize(function(err, tokens){
					if(err){
						return reject(err);
					}	
					return resolve(serviceAuth);	
				});		
			});
		}
	};	
})();


