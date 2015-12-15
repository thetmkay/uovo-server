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
		/*	
			getEvents: function(date){
				return new Promise(function(resolve,reject){
				
					var beginning = date.hours(0).minutes(0).seconds(0);
	
					var params = {
						calendarId: config.google.calendar.id,
						timeMin: beginning.format(),
						timeMax: beginning.add(1, 'days').format(),
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
			},*/
			
			getLatestToken: function(){
				return new Promise(function(resolve,reject){
					
					var params = {
						calendarId: config.google.calendar.id,
						fields:'nextSyncToken'
					}	

					gcal.events.list(params, function(err,response){
						if(err){
							return reject(err)
						}
						
						resolve(response)
					})	

				})
			},

			getEventsChangedSince: function(lastSyncToken,calendarId){
				return new Promise(function(resolve,reject){
				
					var params = {
						calendarId: calendarId,
						singleEvents: true
					};

					if(lastSyncToken){
						syncToken: lastSyncToken	
					}

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

			watch: function(eventId){

				
				return new Promise(function(resolve,reject){
					var params = {
						calendarId: config.google.calendar.id,
						type:'web_hook',
						resource: data
					};
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
