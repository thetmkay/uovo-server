module.exports = (function(){

	'use strict';

	var fbConfig = require('../config.js').fieldbook;

	var book = require('fieldbook-promise')(fbConfig);

	const EVENTS_SHEET = 'events';

	function find(arr, pred){
		for(let i = 0; i < arr.length; i++){
			if(pred(arr[i])) {
				return arr[i];
			}
		}
		
		return false;
	}

	function findEventRecord(sheet, eventId){
		return find(sheet, function(evRec){
				evRec.eventId === eventId;
		});
	}

	return {
		checkEvent: function(req,res,next){
			var eventData = req.body.eventData;

			book.getSheet(EVENTS_SHEET).then(function(sheet){
				
				var eventRecord = findEventRecord(sheet,eventData.eventId);

				if(!eventRecord){
					req.calendarEvent = false;	
					next();
					return;
				}

				req.calendarEvent = eventRecord;	
				next();
				return;
			}, function(err){
				res.status(err.status || 404).json(err);
			});	
		},

		addEvent: function(req,res,next){
			if(req.calendarEvent) {
				return next();
			}

			var eventData = req.calendarEventData;

			if(!eventData) {
				return res.status(404).json({
					status: 404,
					message: 'No calendar event data'
				});
			}

			book.getSheet(EVENTS_SHEET).then(function(sheet){
				var eventRecord = findEventRecord(sheet, eventData.eventId);
				
				if(eventRecord){
					//event record already exists
					console.error('Record exists');
					return Promise.resolve(eventRecord);
				}

				return book.addRecord(sheet, {
					eventId: eventData.eventId,
					scheduledStart: eventData.startTime,
					scheduledEnd: eventData.endTime,
					name: eventData.name
				});
			}).then(function(eventRecord){
				req.calendarEvent = eventRecord;
				next();
			},function(err){
				res.status(err.status || 404).json(err);
			});	

		},

		checkIn : function(req,res){

			var checkInTime = req.body.checkInTime;
	
		},

		checkOut: function(req,res){
			res.send('check out');
		},

		skip: function(req,res){
			res.send('skip');
		}
	}
})();
