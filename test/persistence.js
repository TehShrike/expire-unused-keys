require('loud-rejection')()
var Expirer = require('../')
var test = require('tape')
const level = require('./helpers/level-mem')

test('make sure event fires immediately with a new instantiation created later', function(t) {
	var db = level()

	t.plan(1)

	var expirer = new Expirer({ timeoutMs: 2000, db, checkIntervalMs: 10 })
	expirer.touch('thingy')
	expirer.on('expire', function(key) {
		t.ok(false, 'Expirer has been stopped and should not emit any expire events')
	})
	expirer.stop()

	setTimeout(function() {
		var secondExpirer = new Expirer({ timeoutMs: 1000, db, checkIntervalMs: 10 })
		secondExpirer.on('expire', function(key) {
			t.equal('thingy', key, 'Same key as was touched')
		})
		// Should emit in 10ms since the expire time we passed in to this one was only 1 second,
		// and the key was last touched 1.5 seconds ago
		setTimeout(function() {
			secondExpirer.stop()
			t.end()
		}, 20)
	}, 1500)
})

test('make sure event fires at the correct time from a different instantiation', function(t) {
	var db = level()
	var started = new Date().getTime()
	var expirer = new Expirer({ timeoutMs: 100, db, checkIntervalMs: 5 })

	expirer.touch('sup')
	expirer.stop()

	var secondExpirer = new Expirer({ timeoutMs: 100, db, checkIntervalMs: 5 })

	t.timeoutAfter(1000)

	t.plan(3)

	secondExpirer.on('expire', function(key) {
		var now = new Date().getTime()
		t.ok(started + 100 <= now, "It's been at least 100ms")
		t.ok(started + 115 >= now, "It's been less than 115ms")
		t.equal('sup', key, "It's the same key (sup)")
		secondExpirer.stop()
		t.end()
	})
})
