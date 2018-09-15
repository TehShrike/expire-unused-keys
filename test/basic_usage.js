require('loud-rejection')()
const Expirer = require('../')
const test = require('tape')
const level = require('./helpers/level-mem')
const spaces = require('level-spaces')

function basicTest(t, dbFactory) {
	t.test("fire an event after 5 seconds of inactivity", async(t) => {
		const expirer = Expirer({ timeoutMs: 2000, db: dbFactory() })
		const key = "lol I'm a key"

		t.timeoutAfter(6000)

		await expirer.touch(key)

		t.plan(2)

		var expired = false

		setTimeout(function() {
			t.notOk(expired, "it shouldn't expire for at LEAST 1.5 seconds")
		}, 1500)

		expirer.on('expire', eventKey => {
			expired = true
			t.equals(key, eventKey, "make sure the key that expired is the one that was passed in")
			expirer.stop()
		})
	})

	t.test("make sure each event only expires once", function(t) {
		var expirer = Expirer({ timeoutMs: 1000, db: dbFactory() })

		var expiredSoFar = {
			'wat': false,
			'huh': false,
			'oh HELL naw': false,
			'like, whatever': false,
		}

		var keys = Object.keys(expiredSoFar)

		t.plan(keys.length)

		keys.forEach(function(key) {
			expirer.touch(key)
		})

		expirer.on('expire', function(key) {
			t.notOk(expiredSoFar[key], key + ' is being expired for the first time')
			expiredSoFar[key] = true
		})

		setTimeout(expirer.stop, 2500)
	})

	t.test('an expired event should fire as soon as the expirer starts', async function(t) {
		var db = dbFactory()

		var expiredKey = 'whatevs'

		await db.put(expiredKey, new Date().getTime() - 1500)

		var expirer = Expirer({ timeoutMs: 1000, db: db })

		expirer.on('expire', function(key) {
			t.equal(key, expiredKey)
			t.end()
		})

		t.timeoutAfter(100)
	})
}

test('basic test with regular level-mem', function(t) {
	basicTest(t, level)
})

test('basic test with a level-spaces db', function(t) {
	basicTest(t, () => spaces(level(), 'child-space'))
})
