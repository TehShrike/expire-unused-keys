require('loud-rejection')()
var test = require('tape')
const level = require('./helpers/level-mem')

var Expirer = require('../')

test('repeatExpirations', function(t) {
	// Some levelUP db
	var db = level()
	// Expire stuff after 15 seconds of inactivity
	var expirer = new Expirer({
		timeoutMs: 200,
		db: db,
		checkIntervalMs: 20,
		repeatExpirations: true,
	})

	// Things are only interesting if they were active in the last 15 seconds
	var counters = {
		thing: 0,
	}

	expirer.on('expire', function(thingKey) {
		counters[thingKey]++
	})

	expirer.touch('thing')

	t.plan(7)

	t.equal(counters.thing, 0, 'expired 0x')

	setTimeout(function() {
		t.equal(counters.thing, 0, 'expired 0x')
	}, 100)

	setTimeout(function() {
		t.equal(counters.thing, 1, 'expired 1x')
	}, 300)

	setTimeout(function() {
		t.equal(counters.thing, 2, 'expired 2x')
	}, 500)

	setTimeout(function() {
		t.equal(counters.thing, 3, 'expired 3x')
	}, 700)

	setTimeout(function() {
		t.equal(counters.thing, 4, 'expired 4x')
	}, 900)

	setTimeout(function() {
		t.equal(counters.thing, 5, 'expired 5x')
		expirer.stop()
		t.end()
	}, 1100)
})
