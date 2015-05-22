var Expirer = require('../')
var test = require('tape')
var level = require('level-mem')

test("stopping actually makes it stop", function(t) {
	var expirer = new Expirer(500, level('wat'))
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
