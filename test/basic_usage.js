var Expirer = require('../')
var test = require('tap').test

test("fire an event after 5 seconds of inactivity", function(t) {
	var expirer = new Expirer(5)
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
	})
})

test("make sure each event only expires once", function(t) {
	var expirer = new Expirer(5)

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
})

test("calling the constructor as a function", function(t) {
	var EventEmitter = require('events').EventEmitter
	var expirer = Expirer(5)
	t.ok(expirer instanceof EventEmitter)
	t.end()
})
