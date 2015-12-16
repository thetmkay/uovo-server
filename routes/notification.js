module.exports = (function(){

	var uuid = require('uuid')
	var nano = require('nano')
	var config = require('../config')
	var gapi = require('../gapi')

	var notificationId;
	var token;
	
	return {
		authorize: function (req,res,next){
			var valid = req.body.id === notificationId &&
							req.body.token === token &&
							req.body.kind === 'api#channel'

			if (valid) {
				next()
			} else {
				res.status(404).json({
					message: 'Not found'
				})
			}
		},

		createPush: function (req,res,next){

			notificationId = uuid.v4()
			token = 'watch=' + uuid.v4()

			var params = {
				id: notificationId,
				token: token,
				type: 'web_hook',
				address: 'https://uovo.ytil.xyz/google/notification'
			}

			gapi.calendar.watch(params).then(function(response){
				console.log(response);
				res.json(response)
			}).catch(function(err){
				console.log(err)
				res.status(404).json(err)
			})
		}

	}
})()
