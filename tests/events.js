var test = require('tape'),
	config = require('../config'),
	app = require('../server'),
	request = require('supertest');

test('/events', function(t){
	request(app)
		.get('/events')
		.expect(200)
		.end(function(err,res){
			console.log(res);
			t.ok(res.body.length > 0, 'At least one event is returned in body');
			t.end(err);
		});
});

