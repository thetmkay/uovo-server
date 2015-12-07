module.exports = (function(){

	var google = require('googleapis');
	var gcal = google.calendar('v3');

	return{
		options: function(opts){
			google.options(opts);
		},

		calendar: {
			
			list: function(){
				return new Promise(function(resolve,reject){
					resolve({});
				});
			}

		}
	}
})();
