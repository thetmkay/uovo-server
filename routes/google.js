module.exports = (function(){	
	var moment = require('moment'),	
		constants = require('../constants.js'),
		gauth  = require('../gauth.js'),
		gapi = require('../gapi.js');
	
	const REDIRECT_URL = 'http://localhost:3000/auth/google/callback';

	var lastSyncToken;

	gapi.calendar.getLatestToken(function(response){
		lastSyncToken = response.nextSyncToken
	});

	function updateColor(color) {
		return function(req,res,next){
			console.log('google: updateColor');
			var eventId = req.body.eventId;

			var responseBody = {};
			if(req.newData){
				responseBody = req.newData;
			}

			if(!eventId) {
				responseBody.error = {
					status: 404,
					message: 'No event ID'
				};
				return res.status(200).json(responseBody);
			}
			gapi.calendar.updateEvent(eventId, { colorId: color.google_id }).then(function(ev){
				responseBody.message = 'Successfully updated';

				res.status(200).json(responseBody);
			}, function(err){
				//just because color doesn't change doesn't mean request failed
				responseBody.error = err;
				return res.status(200).json(responseBody);
			});	
		}
	}

	function mapEvents(events){
		return events.map(function(ev){
			return  {
				name: ev.summary,
				start_time:moment(ev.start.dateTime).format(),
				end_time:moment(ev.end.dateTime).format(),
				check_in_time: false,
				check_out_time: false,
				skipped: false,
				date: moment(ev.start.dateTime).format('YYYY-MM-DD'),
				_id: ev.id
			}
		});
	}

	function notSkipped(record){
		return !record.skipped || record.skipped === 'false';
	}

	return {
		
		authorize: function(req,res,next){
			gauth.authorize().then(function(client){
				gapi.options({auth:client});
				next();
			}, function(err){
				res.status(err.status || err.code || 403).json(err);
			});
		},

		checkIn: function(req,res,next){
			console.log('google: checkin');
			if(notSkipped(req.calendarEvent) && !req.calendarEvent.check_out_time){
				updateColor(constants.colors.orange)(req,res,next);	
			} else{
				res.status(200).json(req.newData);
			}
		},

		checkOut: function(req,res,next){
			if(notSkipped(req.calendarEvent)) {
				updateColor(constants.colors.green)(req,res,next);	
			} else{
				res.status(200).json(req.newData);
			}
		},

		skip: function(req,res,next){
			updateColor(constants.colors.red)(req,res,next);	
		},

		checkEvent: function(req,res,next){
			if(req.calendarEvent){
				next();
				return;
			}		

			if(req.calendarEventData || !req.body.eventId){
				res.status(404).json({
					status: 404,
					message: 'Invalid request object'
				});
			}

			gapi.calendar.getEvent(req.body.eventId).then(function(calendarEvent){
				req.calendarEventData = calendarEvent;
				next();
				return;

			}, function(err){
				res.status(err.status || err.code  || 404).json(err);
			});
		},

		getChanges: function(req,res,next){
			console.log('notification')
			
			var resourceId = require('../config').google.calendar.id
			//var resourceId = req.body.resourceId
			
			gapi.calendar.getEventsChangedSince(lastSyncToken,resourceId).then(function(response){
				lastSyncToken = response.nextSyncToken
				console.log(`gapi fetched: ${response.items.length}`)
				req.events = mapEvents(response.items)	
				console.log('mapped')
				next()
			}, function(err){
				res.status(err.status || err.code || 404).json(err)
			})
		}
	
	}	
})();
