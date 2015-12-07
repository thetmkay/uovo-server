module.exports = (function(){

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

	return {
		checkin : function(req,res){

			var eventId = req.body.eventId,
				checkInTime = req.body.checkInTime;

			book.getSheet(EVENTS_SHEET).then(function(sheet){
				
				var eventRecord = find(sheet, function(evRec){
					evRec.eventId === eventId;
				});
	
			},function(err){
				res.status(err.status || 404).json(err);
			});	
		}
	}
})();
