module.exports = (function(){
	
	'use strict'

	var db = require('../middleware/couch')

	function getRev(eventId){
		return db.head(eventId).then(function(body){
			return body[1].etag.replace(/\"/g,'')
		}).catch(function(err){
			console.error(err)
		})
	}

	function updateEvent(eventId, key, value, onlyOnce, res){
		db.get(eventId,{ revs_info: true }).then(function(body){
			var ev = body[0]
			if(onlyOnce && ev[key]){
				return ev
			}		
			
			ev[key] = value
			return db.insert(ev)
		}).then(function(ev){
			var response = {
				eventId: eventId
			}		
			response[key] = value
			res.status(200).json(response)
		}).catch(function(err){
			res.status(err.statusCode || 404).json(err)
		})
	}

	return {

		checkIn: function (req,res,next) {
			updateEvent(req.body.eventId, 'check_in_time', res.checkInTime, true, res)	
		},

		checkOut: function(req,res,next) {
			updateEvent(req.body.eventId, 'check_out_time', req.checkOutTime, true, res)	
		},

		skip: function(req,res,next) {
			updateEvent(req.body.eventId, 'skipped', req.skipped, false, res)	
		},
		
		getEvents: function(req,res,next) {
			var date = req.params.date
		
			db.view('day','byDate',{keys:[date]}).then(function(body){
				res.status(200).json({
					date: req.date,
					events: body
				})
			},function(err){
				res.status(err.statusCode || 404).json(err)
			})		
		},

		updateEvents: function(req,res,next){
			var events = req.events
			var count = 0;
			Promise.all(events.map(function(ev,index){
				return getRev(ev._id).then(function(rev){
					if(ev.status){
						count++	
					}
					if(ev.status === 'cancelled'){
						console.log('cancelled')
						return db.destroy(body._id, body.rev);		
					}	
					ev._rev = rev
					return db.insert(ev)
				});	
			})).then(function(arr){
				res.status(200).end()
			})
		}	

	}

})()
