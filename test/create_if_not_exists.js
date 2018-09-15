require('loud-rejection')()
const makeDb = require('./helpers/level-mem')
var Expirer = require('../')
var test = require('tape')

test('create key if it doesn\'t exist yet', async function(t) {
	var expirer = new Expirer({
		timeoutMs: 5000,
		db: makeDb('watever'),
	})

	t.plan(1)

	await expirer.touch('old')

	expirer.once('touch', key => {
		console.log('touched', key)
		t.equal(key, 'new')
		t.end()
	})

	console.log('here')

	await expirer.createIfNotExists('old')

	await expirer.createIfNotExists('new')
})
