var EventEmitter = require('events').EventEmitter

function onlyLetOneTaskRunAtATime(fnTask) {
	var running = false

	function done() {
		running = false
	}

	return function run() {
		if (!running) {
			running = true
			var args = Array.prototype.slice.call(arguments, 0)
			args.push(done)
			fnTask.apply(null, args)
		}
	}
}

module.exports = function Expirer(timeoutMs, db, checkIntervalMs) {
	var expirer = new EventEmitter()

	var checkForExpiredKeys = onlyLetOneTaskRunAtATime(function check(done) {
		var batch = db.batch()
		var now = new Date().getTime()
		db.createReadStream().on('data', function(data) {
			if (parseInt(data.value) + timeoutMs < now) {
				expirer.emit('expire', data.key)
				batch.del(data.key)
			}
		}).on('end', function() {
			batch.write(done)
		})
	})

	expirer.on('touch', function touch(key) {
		db.put(key, new Date().getTime())
	})

	expirer.on('forget', function forget(key) {
		db.del(key)
	})

	var interval = setInterval(checkForExpiredKeys, checkIntervalMs || 1000)

	expirer.touch = expirer.emit.bind(expirer, 'touch')
	expirer.forget = expirer.emit.bind(expirer, 'forget')
	expirer.stop = function stop() {
		clearInterval(interval)
	}

	return expirer
}
