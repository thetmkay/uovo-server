module.exports = (function(){

	var google = require('googleapis');
	var gcal = google.calendar('v3');
	var moment = require('moment');
	var config = require('./config');

	return{
		options: function(opts){
			google.options(opts);
		},

		calendar: {
			
			events: function(){
				return new Promise(function(resolve,reject){
					var params = {
						calendarId: config.google.calendar.id,
						timeMin: moment().subtract(4, 'hours').format(),
						timeMax: moment().add(23, 'hours').format()
					};

					gcal.events.list(params, function(err,response){
						if(err) {
							return resolve(err);
						}

						console.log(response);
						resolve(response);	
					})
				});
			}

		}
	}
})();
