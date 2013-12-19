var Expirer = require('../')
var test = require('tap').test
var level = require('level-mem')

// To test this, I threw a setTimeout(..., 1000) into the .on('end') in checkForExpiredKeys

// test("If an object is forgotten while the expired keys are being checked, make sure the forgotten key is ignored", function(t) {
// 	var expirer = new Expirer(10, level('wat'), 100)

// 	var remembered = "lol I'm a key"
// 	var forgotten = "another key, what's this"

// 	expirer.touch(remembered)
// 	expirer.touch(forgotten)

// 	t.plan(1)

// 	expirer.on('expire', function(key) {
// 		t.equal(key, remembered, 'the lol key was expired')
// 	})

// 	setTimeout(function() {
// 		expirer.forget(forgotten)
// 	}, 200)

// 	setTimeout(function() {
// 		expirer.stop()
// 		t.end()
// 	}, 1500)
// })
