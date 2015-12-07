
function checkIn(event) {
	
	console.log('check in');

	var eventId = this.parentNode.dataset.eventId;

	aja()
		.url('event/checkin')
		.method('post')
		.body({
			eventId: eventId,
			checkInTime: new Date().toISOString()
		})
		.on('success', function(response){
			console.log('success');
			console.log(response);
		})
		.on('40*', function(response){
			console.log('error');
			console.log(response);
		})
		.go();
}

function checkOut(event) {
	
	console.log('check out');

	var eventId = this.parentNode.dataset.eventId;

	aja()
		.url('event/checkout')
		.method('post')
		.body({
			eventId: eventId,
			checkOutTime: new Date().toISOString()
		})
		.on('success', function(response){
			console.log('success');
			console.log(response);
		})
		.on('40*', function(response){
			console.log('error');
			console.log(response);
		})
		.go();
}

document.addEventListener('DOMContentLoaded', function(){
	var checkInBtns = document.querySelectorAll('.check-in');
	console.log('check-ins: ' + checkInBtns.length);

	for(var i = 0; i < checkInBtns.length; i++){
		checkInBtns[i].addEventListener('click', checkIn);
	}
	var checkOutBtns = document.querySelectorAll('.check-out');
	console.log('check-outs: ' + checkOutBtns.length);

	for(var i = 0; i < checkOutBtns.length; i++){
		checkOutBtns[i].addEventListener('click', checkOut);
	}

});
