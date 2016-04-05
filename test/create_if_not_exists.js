var Expirer = require('../')
var test = require('tape')
var level = require('level-mem')

test('create key if it doesn\'t exist yet', function(t) {
	var expirer = new Expirer({
		timeoutMs: 5000,
		db: level('wat')
	})

	t.plan(1)

	expirer.touch('old')

	expirer.once('touch', function(key) {
		t.equal(key, 'new')
		t.end()
	})

	setTimeout(function () {
		expirer.createIfNotExists('old')
	}, 100)
	
	setTimeout(function () {
		expirer.createIfNotExists('new')
	}, 200)
})
