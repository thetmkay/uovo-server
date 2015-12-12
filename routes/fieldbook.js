module.exports = (function(){

	'use strict';

	var fbConfig = require('../config.js').fieldbook,
		moment = require('moment');

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

			req.newData = newData;

			var hasAdded = false;
			for(let i in Object.keys(newData)){
				let prop = Object.keys(newData)[i];	
				console.log(prop + ': ' + !calendarEvent[prop]);
				if(!calendarEvent[prop] || (prop === 'skipped')){
					calendarEvent[prop] = newData[prop];
					hasAdded = true;
				}	
			}	
			
			if(!hasAdded){
				console.log('nothing new');
				return res.status(200).json({
					message: 'No update'
				});
			}

			book.updateRecord(EVENTS_SHEET,calendarEvent.id, newData).then(function(record){
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
				check_in_time: checkInTime
			}

			updateRecord(newData)(req,res,next);		 
		},

		checkOut: function(req,res,next){
			var checkOutTime = req.body.checkOutTime;

			var newData = {
				check_out_time: checkOutTime
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

			var date = moment(req.params.date).format('YYYY-MM-DD');

			book.getSheet(EVENTS_SHEET).then(function(sheet){
				
				return Promise.all(events.map(function(ev){
					
					var eventRecord = findEventRecord(sheet,ev.event_id);
					if(!eventRecord){
						ev.check_in_time = null;
						ev.check_out_time = null;
						ev.skipped = null;	

						return book.addRecord(EVENTS_SHEET,ev);
					} else{
						ev.check_in_time = eventRecord.check_in_time;
						ev.check_out_time = eventRecord.check_out_time;
						ev.skipped = eventRecord.skipped;	
						return ev;
					}

				}));	
			}).then(function(events){
				res.json({
					events:events,
					date:date
				});	
			},function(err){
				res.status(err.status || 404).json(err);
			});	
		}
	}
})();
