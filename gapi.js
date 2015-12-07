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
						timeMax: moment().add(23, 'hours').format(),
						orderBy: 'startTime',
						singleEvents: true
					};

					gcal.events.list(params, function(err,response){
						if(err) {
							return reject(err);
						}

						resolve(response);	
					})
				});
			},

			getEvent: function(eventId){
				return new Promise(function(resolve,reject){
					var params = {
						calendarId: config.google.calendar.id,
						eventId: eventId
					}

					gcal.events.get(params, function(err, response){
						if(err){
							return reject(err);
						}
						resolve(response);
					});
				});
			},

			updateEvent: function(eventId,data){
				return new Promise(function(resolve,reject){
					var params = {
						calendarId: config.google.calendar.id,
						eventId: eventId,
						resource: data 
					}


					gcal.events.patch(params, function(err, response){
						if(err){
							return reject(err);
						}
						resolve(response);
					});
				});
			}
		}
	}
})();
