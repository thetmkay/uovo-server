module.exports = (function(){
	var nano = require('nano')
	var prom = require('nano-promises')
	var gapi = require('./gapi')
	var gauth = require('./gauth')
	var config = require('../config')

	const DBNAME = 'testuovo'
	const DESIGN_DOC = '_design/day'
	const SYNC_DOC = '_local/lastSyncToken'

	var designDoc = {
		views: {
		  byDate: {
			map: 'function(doc){ if(doc.date){ emit(doc.date, doc);	}}'
		  }
		}
	}	
	
	function createDB(api){
		console.log('createDB')
		return api.db.get(DBNAME)
		.catch(function(err){
			if(err.statusCode === 404){
				console.log('db nonexists')
				return api.db.create(DBNAME)
			}
		  	return Promise.reject() 
		}).then(function(){
			return api.db.use(DBNAME)
		})
	}

	function authorizeNano(){
		var api = prom(nano('http://127.0.0.1:5984'))
		console.log('authorize')
		return api.auth(config.couch.username, config.couch.password)
		.then(function(res){
			var header = res[1]
			return prom(nano({
				url:'http://127.0.0.1:5984',
				cookie:header['set-cookie']
			})) 
		})
	}

	function createDesignDoc(db){
		console.log('design doc')
		return db.get(DESIGN_DOC, {})
		.catch(function(err){
			if(err.statusCode === 404){
				console.log('design doc nonexist')
				return db.insert(designDoc, DESIGN_DOC)			
			}
			return Promise.reject()
		})
		.then(function(){
			console.log('design doc return db')
			return db
		})
	}

	function updateDB(db){
		console.log('update db')
		//---- promise factories
		function getGoogleEvents(client){
			console.log('get google events')
			gapi.options({auth:client});
			return gapi.calendar.getChanges()
		}

		function saveEvents(events){
			return Promise.all(events.map(function(ev){
				if(!ev.is_cancelled ){
					return db.insert(ev)
				}
			})) 
		}

		function getToken(docs){
			return gapi.calendar.getSyncToken()
		}

		function saveToken(doc){
			return db.insert(doc)
		}

		return db.get(SYNC_DOC,{revs_info:true}).then(function(res){
			var doc = res[0]
			gapi.calendar.setSyncToken(doc.token);
			return doc
		}).catch(function(err){
			console.error('no token')
			return db.insert({_id:SYNC_DOC})
			.then(function(res){
				return {
					_id: res[0].id,
					_rev: res[0].rev
				}
			})
		}).then(function(doc){
			return gauth.authorize()
			.then(getGoogleEvents)
			.then(saveEvents)
			.then(getToken)
			.then(function(token){
				doc = doc || {}
				doc.token = token
				return doc
			})
			.then(saveToken)
			.then(function(){
				return db;
			})
			.catch(function(err){
				console.error(err)
				return db;
			})
		})
	}

	function scopeDB(api){
		return api.use(DBNAME)
	}

	function returnModule(db){
		function wrapFn(fnName) {
			return function () {
				var args = arguments

				return authorizeNano()
				.then(scopeDB)
				.then(function(db){
					return db[fnName].apply(db, args)
				})		
			}
		}

		return {
			get: wrapFn('get'),
			insert: wrapFn('insert'),
			head: wrapFn('head')
		}	
	}

	return authorizeNano() 
	.then(createDB)
	.then(createDesignDoc)
	.then(updateDB)
	.then(returnModule)
	.catch(function(err){
		console.log('final error')
		var stack = err.stack
		console.error(stack)
		console.error(err)
	})

})()
