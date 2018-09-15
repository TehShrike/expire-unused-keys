require('loud-rejection')()
var Expirer = require('../')
var test = require('tape')
const level = require('./helpers/level-mem')

test('an expired event should only have 1 argument', function(t) {
	t.timeoutAfter(2000)
	t.plan(2)

	var expirer = new Expirer({ timeoutMs: 100, db: level() })

	expirer.touch('hello there')

	expirer.on('expire', (...args) => {
		t.equal(args.length, 1, 'should only have 1 argument')
		t.equal(args[0], 'hello there')

		expirer.stop()
		t.end()
	})
})
