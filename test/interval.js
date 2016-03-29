var test = require('tape')
var level = require('level-mem')

var Expirer = require('../')

test("something closer to a real implementation, for the readme", function(t) {
	// Some levelUP db
	var db = level(':)')
	// Expire stuff after 15 seconds of inactivity
	var expirer = new Expirer(2000, db, {
		checkIntervalMs: 100,
		repeatExpirations: true
	})

	// Things are only interesting if they were active in the last 15 seconds
	var counters = {
		thing: 0
	}

	expirer.on('expire', function(thingKey) {
		counters[thingKey]++
	})

	expirer.touch('thing')

	t.plan(5)

	t.equal(counters.thing, 0, 'has not expired yet')

	setTimeout(function() {
		t.equal(counters.thing, 1, 'expired once')
	}, 1000)

	setTimeout(function() {
		t.equal(counters.thing, 2, 'expired twice')
	}, 3000)

	setTimeout(function() {
		t.equal(counters.thing, 3, 'expired thrice')
		expirer.stop()
	}, 5000)
})
