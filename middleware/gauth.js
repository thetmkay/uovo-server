module.exports = (function(){
	var url = require('url');
	var google = require('googleapis');
	var gcal;

	var config = require('../config');

	const SCOPES = ['https://www.googleapis.com/auth/calendar'];

	var serviceAuth = new google.auth.JWT(config.google.service.client_email,null,config.google.service.private_key, SCOPES);



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


