var Expirer = require('../')
var test = require('tape')
var level = require('level-mem')

test("make sure that calling touch pushes the expiration back", function(t) {
	var expirer = new Expirer(5000, level('wat'))
	var key = 'yo'

	var start = new Date().getTime()

	t.timeoutAfter(10000)
	t.plan(2)

	var touches = 0
	expirer.on('touch', function() {
		touches++
	})

	expirer.on('expire', function() {
		var now = new Date().getTime()
		t.ok(now - start > 8000, "expires once, after about eight point five seconds")
		t.equal(touches, 3, 'emitted touch 3 times')
		expirer.stop()
		t.end()
	})

	// Touch it at 0 seconds
	expirer.touch(key)

	setTimeout(function() {
		// After 2 seconds, touch it again
		expirer.touch(key)
		setTimeout(function() {
			// After another 1.5 seconds (3.5 total), touch it again
			expirer.emit('touch', key)
		}, 1500)
	}, 2000)
})
