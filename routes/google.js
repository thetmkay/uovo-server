module.exports = (function(){	
	var moment = require('moment'),	
		constants = require('../constants.js'),
		gauth  = require('../gauth.js'),
		gapi = require('../gapi.js');
	
	const REDIRECT_URL = 'http://localhost:3000/auth/google/callback';

	function updateColor(color) {
		return function(req,res,next){
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
			updateColor(constants.colors.orange)(req,res,next);	
		},

		checkOut: function(req,res,next){
			updateColor(constants.colors.green)(req,res,next);	
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

		getEvents:function(req,res,next){
			var date = moment(req.params.date);
			gapi.calendar.getEvents(date).then(function(response){

				var events = response.items.map(function(ev){
					return  {
						name: ev.summary,
						start_time:moment(ev.start.dateTime).format(),
						end_time:moment(ev.end.dateTime).format(),
						event_id: ev.id,
						color_id: ev.colorId
					}
				});
				
				req.events = events;
				next();
			}, function(err){
				res.status(err.status || err.code || 404).json(err);
			});
		},
	

		
	}	
})();
