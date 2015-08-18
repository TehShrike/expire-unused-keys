var Expirer = require('../')
var test = require('tape')
var level = require('level-mem')
var spaces = require('level-spaces')

function basicTest(t, dbFactory) {
	t.test("fire an event after 5 seconds of inactivity", function(t) {
		var expirer = new Expirer(2000, dbFactory())
		var key = "lol I'm a key"

		t.timeoutAfter(6000)

		expirer.emit('touch', key)

		t.plan(2)

		var expired = false

		setTimeout(function() {
			t.notOk(expired, "it shouldn't expire for at LEAST 1.5 seconds")
		}, 1500)

		expirer.on('expire', function(eventKey) {
			expired = true
			t.equals(key, eventKey, "make sure the key that expired is the one that was passed in")
			expirer.stop()
		})
	})

	t.test("make sure each event only expires once", function(t) {
		var expirer = new Expirer(1000, dbFactory())

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
			t.notOk(expiredSoFar[key], key + ' is being expired for the first time')
			expiredSoFar[key] = true
		})

		setTimeout(expirer.stop, 2500)
	})

	t.test('an expired event should fire as soon as the expirer starts', function(t) {
		var db = dbFactory()

		var expiredKey = 'whatevs'

		db.put(expiredKey, new Date().getTime() - 1500)

		var expirer = new Expirer(1000, db)

		expirer.on('expire', function(key) {
			t.equal(key, expiredKey)
			t.end()
		})

		t.timeoutAfter(100)
	})
}

test('basic test with regular level-mem', function(t) {
	basicTest(t, function() {
		return level('wat')
	})
})

test('basic test with a level-spaces db', function(t) {
	basicTest(t, function() {
		var db = level('wat')
		return spaces(db, 'child-space')
	})
})

test("calling the constructor as a function", function(t) {
	var EventEmitter = require('events').EventEmitter
	var expirer = Expirer(5, level('wat'))
	t.ok(expirer instanceof EventEmitter, "expirer is an EventEmitter")
	expirer.stop()
	t.end()
})