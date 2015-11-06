var Expirer = require('../')
var test = require('tape')
var level = require('level-mem')

test('an expired event should only have 1 argument', function(t) {
	t.timeoutAfter(2000)
	t.plan(2)

	var expirer = new Expirer(100, level('roflcopter'))

	expirer.emit('touch', 'hello there')

	expirer.on('expire', function() {
		var argArray = Array.prototype.slice.call(arguments)
		t.equal(argArray.length, 1, 'should only have 1 argument')
		t.equal(argArray[0], 'hello there')

		expirer.stop()
		t.end()
	})
})
