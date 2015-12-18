module.exports = (function(){	
	var moment = require('moment'),	
		constants = require('../constants.js'),
		gauth  = require('../middleware/gauth.js'),
		gapi = require('../middleware/gapi.js');
	
	const REDIRECT_URL = 'http://localhost:3000/auth/google/callback';

	var lastSyncToken;

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

		getChanges: function(req,res,next){
			gapi.calendar.getChanges().then(function(events){
				req.events = events	
				next()
			}, function(err){
				res.status(err.status || err.code || 404).json(err)
			})
		}
	
	}	
})();
