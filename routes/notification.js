module.exports = (function(){

	console.log('notification')

	var uuid = require('uuid')
	var nano = require('nano')
	var config = require('../config')
	var gapi = require('../middleware/gapi')
	var gauth = require('../middleware/gauth')

	var couch = require('../middleware/couch')

	const CHANNEL_DOC = '_local/googleNotification'

	var channelId;
	var channelToken;

	function initChannel(){
		console.log('init channel')

		function updateConstants(res){
			console.log('updateConstants')
			var doc = res[0]	
			channelId = doc.channelId				
			channelToken = doc.channelToken	
			return 'Retrieved Channel Successfully'
		}

		function saveConstants (response){
			console.log('saveConstants')
			channelToken = response.token
			channelId = response.id	
			return couch.then(function(db){
				return db.insert({
					_id: CHANNEL_DOC,
					channelId: channelId,
					channelToken: channelToken
				})
			})
		}

		couch.then(function(db){
			console.log('couch then')
			return db.get(CHANNEL_DOC, {})
		})
		.then(updateConstants)
		.catch(function setUpWatch(err){
			if(!err)
				return
			//set up new watch
			gauth.authorize()
			.then(function(client){
				gapi.options({auth:client})
				return 
			})
			.then(createChannel)
			.then(saveConstants)
			.then(function(response){
				return 'Created Channel Succesfully'
			})
			.catch(function(err){
				console.log(err)
			})
		})
	}

	function createChannel(){
		console.log('createChannel')
		return new Promise(function(resolve,reject){

			var params = {
				id: uuid.v4(),
				token: 'watch=' + uuid.v4(),
				type: 'web_hook',
				address: 'https://uovo.ytil.xyz/google/notification'
			}

			gapi.calendar.watch(params).then(function(response){
				console.log(`response: ${response}`)
				resolve(response)
			}).catch(function(err){
				reject(err)
			})
		})
	}

	initChannel()
	
	return {
		authorize: function (req,res,next){
			var googleId = req.headers['x-goog-channel-id']
			var googleToken = req.headers['x-goog-channel-token']
			var googleState = req.headers['x-goog-resource-state']
			var valid = googleId === channelId  &&
							googleToken === channelToken &&
							googleState === 'sync'

			console.log(`${channelId} vs ${googleId}`)
			console.log(`${channelToken} vs ${googleToken}`)
			console.log(`${googleState}`)

			if (valid) {
				console.log('valid notification')
				next()
			} else {
				console.error('invalid notification')
				res.status(404).json({
					message: 'Not found'
				})
			}
		},

		createPush: function (req,res,next){

			initChannel().then(function(response){
				console.log(response);
				res.json({
					message:response
				})
			}).catch(function(err){
				console.log(err)
				res.status(404).json(err)
			})
		}

	}
})()
