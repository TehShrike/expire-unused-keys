var Expirer = require('../')
var test = require('tap').test
var level = require('level-mem')

test("forget an event, don't fire the expiration", function(t) {
	var expirer = new Expirer(100, level('wat'), 1)

	var remembered = "lol I'm a key"
	var forgotten = "another key, what's this"

	expirer.touch(remembered)
	expirer.touch(forgotten)

	t.plan(2)

	var started = new Date().getTime()

	expirer.on('expire', function(key) {
		t.equal(remembered, key, "It's the key we were expecting")
		var now = new Date().getTime()
		t.ok(now >= started + 100, "The event was fired at least 100ms after we started")
	})

	setTimeout(function() {
		expirer.forget(forgotten)
	}, 20)

	setTimeout(function() {
		expirer.stop()
		t.end()
	}, 150)
})
