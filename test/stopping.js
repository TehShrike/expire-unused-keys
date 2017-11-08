require('loud-rejection')()
var Expirer = require('../')
var test = require('tape')
const level = require('./helpers/level-mem')

test("stopping actually makes it stop", function(t) {
	var expirer = new Expirer({ timeoutMs: 500, db: level() })
	t.plan(2)

	expirer.on('expire', function() {
		t.fail('Should not fire after stop is called')
	})

	expirer.touch('whatever')

	setTimeout(function() {
		t.pass('stop called')
		expirer.stop()
	}, 300)

	setTimeout(function() {
		t.pass('made it to 1500ms without emitting anything')
		t.end()
	}, 1500)
})
