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
				console.log(evRec.eventid);
				evRec.eventid === eventId;
		});
	}

	function updateRecord(newData){
		return function(req,res){

			console.log('fieldbook:update Record');

			var calendarEvent = req.calendarEvent;	
			if(!calendarEvent){
				return res.status(404).json({
					status: 404,
					message: 'No calendar event'
				});
			}

			book.updateRecord(EVENTS_SHEET,calendarEvent.id, newData).then(function(record){
				res.status(200).json({
					message: 'Updated successfully'
				});
			}, function(err){
				res.status(err.status || 404).json(err);
			});
		}
	}

	return {
		checkEvent: function(req,res,next){
			var eventId = req.body.eventId;

			console.log('fieldbook:check Event');

			book.getSheet(EVENTS_SHEET).then(function(sheet){
				
				var eventRecord = findEventRecord(sheet,eventId);

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

			console.log('fieldbook: addEvent');

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


				return book.addRecord(EVENTS_SHEET, {
					eventid: eventData.id,
					scheduledstart: eventData.start.dateTime,
					scheduledend: eventData.end.dateTime,
					name: eventData.summary
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

			var newData = {
				checkin: checkInTime
			}

			updateRecord(newData)(req,res);		 
		},

		checkOut: function(req,res){
			var checkOutTime = req.body.checkOutTime;

			var newData = {
				checkout: checkOutTime
			}

			updateRecord(newData)(req,res);		 
		},

		skip: function(req,res){
			res.send('skip');
		}
	}
})();
