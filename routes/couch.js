module.exports = (function(){
	
	'use strict'

	var couch = require('../middleware/couch')

	function getRev(eventId,db){
		console.log('rev')
		return db.head(eventId).then(function(body){
			console.log('head')
			return body[1].etag.replace(/\"/g,'')
		}).catch(function(err){
			console.error(err)
		})
	}

	function updateEvent(eventId, key, value, onlyOnce, res){
		couch.then(function(db){
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
			couch.then(function(db){	
				db.view('day','byDate',{keys:[date]}).then(function(body){
					res.status(200).json({
						date: req.date,
						events: body
					})
				},function(err){
					res.status(err.statusCode || 404).json(err)
				})		
			})
		},

		updateEvents: function(req,res,next){
			console.log('updateEvents')
			console.log(req.events)
			var events = req.events
			var count = 0;
			couch.then(function(db){
				console.log('then')
				console.log(events.length)
				return Promise.all(events.map(function(ev){
					return getRev(ev._id,db).then(function(rev){
						if(ev.is_cancelled){
							console.log('cancelled')
							return db.destroy(ev._id, rev);		
						}	
						ev._rev = rev
						return db.insert(ev)
					});	
				})).then(function(arr){
					res.status(200).end()
				}).catch(function(err){
					console.log(err)
					res.status(401).end()
				})
			})
		}	

	}

})()
