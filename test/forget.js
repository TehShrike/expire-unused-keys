require('loud-rejection')()
var Expirer = require('../')
var test = require('tape')
const level = require('./helpers/level-mem')
const delay = require('delay')

test("forget an event, don't fire the expiration", async t => {
	const expirer = new Expirer({ timeoutMs: 100, db: level(), checkIntervalMs: 1 })

	const remembered = "lol I'm a key"
	const forgotten = "another key, what's this"

	expirer.touch(remembered)
	expirer.touch(forgotten)

	t.plan(2)

	const started = new Date().getTime()

	expirer.on('expire', function(key) {
		t.equal(remembered, key, "It's the key we were expecting")
		const now = new Date().getTime()
		t.ok(now >= started + 100, "The event was fired at least 100ms after we started")
	})

	await delay(20)

	expirer.forget(forgotten)

	await delay(130)

	expirer.stop()
	t.end()
})

test("forget an event with an async callback", async t => {
	const expirer = new Expirer({ timeoutMs: 100, db: level(), checkIntervalMs: 1 })

	const remembered = "lol I'm a key"
	const forgotten = "another key, what's this"

	expirer.touch(remembered)
	expirer.touch(forgotten)

	t.plan(3)

	const started = new Date().getTime()
	let expired = false

	expirer.on('expire', key => {
		t.equal(remembered, key, "It's the key we were expecting")
		const now = new Date().getTime()
		t.ok(now >= started + 100, "The event was fired at least 100ms after we started")
		expired = true
	})

	await delay(20)

	await expirer.forget(forgotten)

	await delay(130)

	t.ok(expired)

	expirer.stop()
	t.end()
})
