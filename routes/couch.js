module.exports = (function(){

	var nano = require('nano')
	var prom = require('nano-promises')

	var db = prom(nano('http://127.0.0.1:5984')).db.use('uovo') 

		
	var designDoc = {
		views: {
		  byDate: {
			map: function(doc){
				if(doc.date){
					emit(doc.date, doc)
				}
			}
		  }
		}
	  }


	db.insert('_design/day', designDoc);

	return {

		checkIn: function (req,res,next) {
			var eventId = req.body.checkIn
			db.get(eventId, {revs_info:true}).then(function(body){
				console.log(body)
			})
		},

		checkOut: function(req,res,next) {

		},

		skip: function(req,res,next) {

		},
		
		getEvents: function(req,res,next) {
			var date = req.date
		
			db.view('day',byDate,{keys:[date]}).then(function(body){
				res.status(200).json({
					date: req.date,
					events: body
				})
			},function(err){
				console.error(`couch-getEvents-error: ${err}`)
			})		
		},

		updateEvents: function(req,res,next){
			console.log(`addEvents: ${req.events.length}`)
			var events = req.events

			Promise.all(events.map(function(ev,index){
				
				if(ev.status === 'cancelled'){
					return db.get(ev._id).then(function(body){
						return db.destroy(body._id, body.rev);		
					})
				}	
				return db.insert(ev)
			})).then(function(arr){
				res.status(200).end()
			})
		}	

	}

})()
