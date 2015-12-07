module.exports = (function(){	
	var moment = require('moment'),	
		gauth  = require('../gauth.js'),
		gapi = require('../gapi.js');
	
	const REDIRECT_URL = 'http://localhost:3000/auth/google/callback';

	return {

		auth: function(req,res){
			gauth.getAuthUrl(REDIRECT_URL).then(function(url){
				res.redirect(url);
			},function(err){
				res.status(err.status || 404).json(err);
			});
		},

		callback: function(req,res){
			var code = req.query.code;
			if(!code){
				return res.status(404).json({
					status: 404,
					message: 'Code not returned from google'
				});
			}
			gauth.getAuthClient(code).then(function(client){
				gapi.options({auth:client});
				res.redirect('/list');
			}, function(err){
				res.status(401).json(err);
			});
		},
		
		events:function(req,res){
			gapi.calendar.events().then(function(response){

				var events = response.items.map(function(ev){
					return  {
						name: ev.summary,
						date: moment(ev.start.dateTime).format('D/M/YY'),
						startTime:moment(ev.start.dateTime).format('H:mm'),
						endTime:moment(ev.end.dateTime).format('H:mm')
					}
				});

				console.log(events);
				res.render('list',{ events: events});

			}, function(err){
				res.status(err.status || 404).json(err);
			});
		}
	}	
})();
