module.exports = (function(){	
	var moment = require('moment'),	
		constants = require('../constants.js'),
		gauth  = require('../gauth.js'),
		gapi = require('../gapi.js');
	
	const REDIRECT_URL = 'http://localhost:3000/auth/google/callback';

	function updateColor(color) {
		return function(req,res,next){
			var eventId = req.body.eventId;
		
			if(!eventId) {
				return res.status(404).json({
					status: 404,
					message: 'No event ID'
				});
			}
			gapi.calendar.updateEvent(eventId, { colorId: color.google_id }).then(function(ev){
				res.status(200).json({
					message: 'Successfully updated'
				});
			}, function(err){
				return res.status(err.status || err.code  || 404).json(err);
			});	
		}
	}

	return {

		auth: function(req,res){
			gauth.getAuthUrl(REDIRECT_URL).then(function(url){
				res.json({url:url});
			},function(err){
				res.status(err.status || err.code  || 404).json(err);
			});
		},

		callback: function(req,res){
			var code = req.query.code;
			if(!code){
				return res.status(404).json({
					status: 404,
					message: 'Code not returned from google'
				});
			}
			gauth.getAuthClient(code).then(function(client){
				gapi.options({auth:client});
				res.redirect('/list');
			}, function(err){
				res.status(401).json(err);
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
		
		events:function(req,res){
			gapi.calendar.events().then(function(response){

				var events = response.items.map(function(ev){
					return  {
						name: ev.summary,
						date: moment(ev.start.dateTime).format('D/M/YY'),
						startTime:moment(ev.start.dateTime).format('H:mm'),
						endTime:moment(ev.end.dateTime).format('H:mm'),
						eventId: ev.id
					}
				});

				res.json(events);
				//res.render('list',{ events: events});

			}, function(err){
				res.status(err.status || err.code || 404).json(err);
			});
		}

		
	}	
})();
