var Expirer = require('../')
var test = require('tap').test
var level = require('level-mem')

test("fire an event after 5 seconds of inactivity", function(t) {
	var expirer = new Expirer(5000, level('wat'))
	var key = "lol I'm a key"

	expirer.emit('touch', key)

	t.plan(2)

	var expired = false

	setTimeout(function() {
		t.notOk(expired, "it shouldn't expire for at LEAST 4 seconds")
	}, 4000)

	expirer.on('expire', function(eventKey) {
		expired = true
		t.equals(key, eventKey, "make sure the key that expired is the one that was passed in")
		expirer.stop()
	})
})

test("make sure each event only expires once", function(t) {
	var expirer = new Expirer(5000, level('wat'))

	var expiredSoFar = {
		'wat': false,
		'huh': false,
		'oh HELL naw': false,
		'like, whatever': false
	}

	var keys = Object.keys(expiredSoFar)

	t.plan(keys.length)

	keys.forEach(function (key) {
		expirer.emit('touch', key)
	})

	expirer.on('expire', function(key) {
		t.equal(expiredSoFar[key], false)
		expiredSoFar[key] = true
	})

	setTimeout(expirer.stop, 5500)
})

test("calling the constructor as a function", function(t) {
	var EventEmitter = require('events').EventEmitter
	var expirer = Expirer(5, level('wat'))
	t.ok(expirer instanceof EventEmitter, "expirer is an EventEmitter")
	expirer.stop()
	t.end()
})
