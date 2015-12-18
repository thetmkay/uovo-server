module.exports = (function(){

	var google = require('googleapis');
	var gcal = google.calendar('v3');
	var moment = require('moment');
	var config = require('../config');

	var lastSyncToken;

	function mapEvents(events){
		return events.map(function(ev){
			return  {
				name: ev.summary,
				start_time:moment(ev.start.dateTime).format(),
				end_time:moment(ev.end.dateTime).format(),
				check_in_time: null,
				check_out_time: null,
				skipped: false,
				date: moment(ev.start.dateTime).format('YYYY-MM-DD'),
				_id: ev.id,
				is_cancelled: ev.status === 'cancelled'
			}
		});
	}

	function getAllPages(response, acc){

		if(!acc) {
			acc = response.items
		}
			
		if(response.nextSyncToken){
			return Promise.resolve([response.nextSyncToken,acc])	
		} else if(!response.nextPageToken){
			return Promise.resolve([null, acc])
		} else {
			var params = {
				calendarId: config.google.calendar.id,
				showDeleted: true,
				singleEvents: true,
				pageToken:response.nextPageToken	
			}
			
			return listEvents(params).then(function(newResponse){
				return getAllPages(newResponse,acc.concat(newResponse.items))
			})
		}
	}

	function listEvents(params){
		return new Promise(function(resolve,reject){
			gcal.events.list(params, function(err,response){
				if(err) {
					return reject(err)
				}
				resolve(response)	
			})
		})
	}

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
		
			setSyncToken: function(token){
				lastSyncToken = token
			},	
	
			getSyncToken: function(){
				return lastSyncToken
			},
			/*
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
			*/
			getChanges: function(){
				var params = {
					calendarId: config.google.calendar.id,
					showDeleted: true,
					singleEvents: true
				}
				if(lastSyncToken){
					params.syncToken = lastSyncToken	
				}

				return listEvents(params)
				.then(getAllPages)
				.then(function(arr){
					var token = arr[0]
					var acc = arr[1]
			
					if(token){
						lastSyncToken = token 
					}
						
					return mapEvents(acc)
				})
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

			watch: function(data){

				return new Promise(function(resolve,reject){
					var params = {
						calendarId: config.google.calendar.id,
						resource: data
					};

					gcal.events.watch(params, function(err,response){
						if(err){
							return reject(err);
						}
						resolve(response);
					})
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
