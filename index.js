var StringMap = require('stringmap')

var EventEmitter = require('events').EventEmitter

var i = 0

var emitExpirationEvent = function(delay, emitter, key) {
	return setTimeout(function() {
		emitter.emit('expire', key)
	}, delay)
}

module.exports = function Expirer(timeoutSeconds) {
	var map = new StringMap()
	var timeoutMs = timeoutSeconds * 1000

	var expirer = new EventEmitter()

	expirer.on("touch", function(key) {
		var timeoutId = map.get(key)

		if (typeof timeoutId !== 'undefined') {
			clearTimeout(timeoutId)
		}

		map.set(key, emitExpirationEvent(timeoutMs, expirer, key))
	})

	return expirer
}
