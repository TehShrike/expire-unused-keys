require('loud-rejection')()
var Expirer = require('../')
var test = require('tape')
const level = require('./helpers/level-mem')

test("Should fire a second time after being touched in an expire callback", function(t) {
	var expirer = new Expirer({ timeoutMs: 500, db: level() })
	var key = "lol I'm a key"

	expirer.touch(key)

	t.plan(2)
	t.timeoutAfter(3000)

	expirer.once('expire', function() {
		t.pass('called the first time')
		expirer.touch(key)
		expirer.once('expire', function() {
			t.pass('called the second time')
			expirer.stop()
			t.end()
		})
	})
})
