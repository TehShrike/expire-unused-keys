var test = require('tap').test

var Expirer = require('../') 
// var Expirer = require('expire-unused-keys')

test("something closer to a real implementation, for the readme", function(t) {
	// Expire stuff after 15 seconds of inactivity
	var expirer = new Expirer(15) 

	// Things are only interesting if they were active in the last 15 seconds
	var areTheseThingsInteresting = {
		'thing1': false,
		'thing2': false
	}

	var activity = function(thingKey) {
		areTheseThingsInteresting[thingKey] = true

		// note that this thing was interacted with
		expirer.emit('touch', thingKey)
	}

	expirer.on('expire', function(thingKey) {
		console.log(thingKey + " expired!")
		areTheseThingsInteresting[thingKey] = false
	})

	activity('thing1')
	activity('thing2')

	t.plan(5)

	t.ok(areTheseThingsInteresting['thing1'], "thing1 is interesting")
	t.ok(areTheseThingsInteresting['thing2'], "thing2 is interesting")

	setTimeout(function() {
		activity('thing1')
	}, 10 * 1000)

	setTimeout(function() {
		t.notOk(areTheseThingsInteresting['thing2'], "thing2 is not interesting after 16 seconds")
	}, 16 * 1000)

	setTimeout(function() {
		t.ok(areTheseThingsInteresting['thing1'], "thing1 is interesting after 16 seconds")
	}, 16 * 1000)

	setTimeout(function() {
		t.notOk(areTheseThingsInteresting['thing1'], "thing1 is not interesting after 26 seconds")
	}, 26 * 1000)
})
