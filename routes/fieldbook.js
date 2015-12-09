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
				return evRec.event_id === eventId;
		});
	}

	function updateRecord(newData){
		return function(req,res,next){

			console.log('fieldbook:update Record');

			var calendarEvent = req.calendarEvent;	
			if(!calendarEvent){
				return res.status(404).json({
					status: 404,
					message: 'No calendar event'
				});
			}

			book.updateRecord(EVENTS_SHEET,calendarEvent.id, newData).then(function(record){
				req.newData = newData;
				next();				
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
				var eventRecord = findEventRecord(sheet, eventData.id);
				
				if(eventRecord){
					//event record already exists
					console.error('Record exists');
					return Promise.resolve(eventRecord);
				}


				return book.addRecord(EVENTS_SHEET, {
					event_id: eventData.id,
					start_time: eventData.start.dateTime,
					end_time: eventData.end.dateTime,
					name: eventData.summary
				});
			}).then(function(eventRecord){
				req.calendarEvent = eventRecord;
				next();
			},function(err){
				res.status(err.status || 404).json(err);
			});	

		},

		checkIn : function(req,res,next){

			var checkInTime = req.body.checkInTime;

			var newData = {
				check_in_time: checkInTime,
				skipped: false
			}

			updateRecord(newData)(req,res,next);		 
		},

		checkOut: function(req,res,next){
			var checkOutTime = req.body.checkOutTime;

			var newData = {
				check_out_time: checkOutTime,
				skipped: false,
			}

			updateRecord(newData)(req,res,next);		 
		},

		skip: function(req,res,next){

			var newData = {
				skipped: true 
			}

			updateRecord(newData)(req,res,next);
		},

		getEvents: function(req,res,next){

			console.log('fieldbook: getEvents');

			var events = req.events;

			book.getSheet(EVENTS_SHEET).then(function(sheet){
				
				return events.map(function(ev){
					
					var eventRecord = findEventRecord(sheet,ev.eventId);
					if(!eventRecord){
						ev.checkInTime = null;
						ev.checkOutTime = null;
						ev.skipped = null;	
					} else{
						ev.checkInTime = eventRecord.check_in_time;
						ev.checkOutTime = eventRecord.check_out_time;
						ev.skipped = eventRecord.skipped;	
					}

					return ev;
				});	
			}).then(function(events){
				res.json(events);	
			},function(err){
				res.status(err.status || 404).json(err);
			});	
		}
	}
})();
