var Expirer = require('../')
var test = require('tap').test
var level = require('level-mem')

test("Should fire a second time after being touched in an expire callback", function(t) {
	var expirer = new Expirer(500, level('wat'))
	var key = "lol I'm a key"

	expirer.emit('touch', key)

	t.plan(2)

	var done = false

	expirer.once('expire', function() {
		t.pass('called the first time')
		expirer.touch(key)
		expirer.once('expire', function() {
			t.pass('called the second time')
			expirer.stop()
			done = true
			t.end()
		})
	})

	setTimeout(function() {
		if (!done) {
			t.fail('both expirations should happen within three seconds')
			expirer.stop()
			t.end()
		}
	}, 3000)
})
