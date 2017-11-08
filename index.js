const makeEmitter = require('better-emitter')
const nextTick = require('iso-next-tick')

function onlyLetOneTaskRunAtATime(fnTask) {
	let running = false

	return async function run() {
		if (!running) {
			running = true
			await fnTask()
			running = false
		}
	}
}

module.exports = function Expirer({ timeoutMs, db, checkIntervalMs = 1000, repeatExpirations = false }) {
	const forgotten = new Set()

	function filterForgotten(keys) {
		return keys.filter(key => !forgotten.has(key))
	}

	const checkForExpiredKeys = onlyLetOneTaskRunAtATime(async() => {
		const now = new Date().getTime()

		const batchKeys = await new Promise(resolve => {
			const batchKeys = []
			db.createReadStream().on('data', function(data) {
				if (parseInt(data.value) + timeoutMs < now) {
					batchKeys.push(data.key)
				}
			}).on('end', () => resolve(batchKeys))
		})

		// Need to make sure that none of these keys were "forgotten" since we opened the read stream
		const expiringNow = filterForgotten(batchKeys)
		const batchObjects = expiringNow.map(key => {
			return repeatExpirations
				? { type: 'put', key: key, value: new Date().getTime() }
				: { type: 'del', key: key }
		})

		try {
			await db.batch(batchObjects)

			filterForgotten(expiringNow)
				.forEach(key => expirer.emit('expire', key))

			forgotten.clear()
		} catch (err) {
			forgotten.clear()
			throw err
		}
	})

	async function touch(key) {
		await db.put(key, new Date().getTime())
		expirer.emit('touch', key)
	}

	async function forget(key) {
		forgotten.add(key)
		await db.del(key)
		expirer.emit('forget', key)
	}

	const interval = setInterval(checkForExpiredKeys, checkIntervalMs)
	interval.unref && interval.unref()

	const expirer = makeEmitter({
		touch,
		forget,
		async createIfNotExists(key) {
			try {
				await db.get(key)
			} catch (err) {
				if (err.notFound) {
					touch(key)
				} else {
					throw err
				}
			}
		},
		stop() {
			clearInterval(interval)
		},
	})

	nextTick(checkForExpiredKeys)

	return expirer
}
