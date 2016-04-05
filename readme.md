[![Build Status](https://travis-ci.org/TehShrike/expire-unused-keys.svg)](https://travis-ci.org/TehShrike/expire-unused-keys)

So I'm writing this other library that needs to do some basic caching, right?  You know - the [first hard thing](http://martinfowler.com/bliki/TwoHardThings.html).  (For an idea of my work on the second hard thing, see the examples below.)

It's not so much that I need flotsam deleted right away when it expires as I want the value to be refreshed every so often, and if that value goes a long enough time with out being accessed, theeeeen I'll drop it.

To lessen the pain in this task, I need a library that will keep track of what the last time was when I accessed something, and alert me if a certain amount of time passes without that thing being touched.  So, making the assumption that those "somethings" can be identified by a string, and the assertion that I will need these last-access-times to persist even after reopening the screen or re-launching the process, I wrote this-here code.

It stores last-access times in a [LevelUP](https://github.com/rvagg/node-levelup) db - if you don't need persistence, throw [level-mem](https://github.com/Level/level-mem) at it.

Example
=====

```js
    // Some levelUP db
	var db = level('wat')
	// Expire stuff after 15 seconds of inactivity
	var expirer = new Expirer(15000, db)

	// Things are only interesting if they were active in the last 15 seconds
	var areTheseThingsInteresting = {
		'thing1': false,
		'thing2': false
	}

	var activity = function(thingKey) {
		areTheseThingsInteresting[thingKey] = true

		// note that this thing was fiddled with
		expirer.touch(thingKey)
	}

	expirer.on('expire', function(thingKey) {
		console.log(thingKey + " expired!")
		areTheseThingsInteresting[thingKey] = false
	})

	activity('thing1')
	activity('thing2')

	setTimeout(function() {
		activity('thing1')
	}, 10 * 1000)

    // thing1 will expire after 25 seconds after the first time it was touched
    // thing2 will expire 15 seconds after the first time it was touched
```

Usage
=====

The module returns a constructor function:

```js
var expireUnusedKeys = require('expire-unused-keys')
```

## expireUnusedKeys(timeoutMs, db, [checkIntervalMs]) - *Backwards compatibility*
## expireUnusedKeys({ timeoutMs, db, [checkIntervalMs,] [repeatExpirations] })

- timeoutMs: how many milliseconds the object will wait before it emits an 'expire' event for a touched key
- db: a LevelUP data store of some kind
- checkIntervalMs: right now, this library works by iterating over all keys and emitting expire events for any items that were last touched timeoutMs ago.  This value prescribes how often the keys should be iterated over.  Defaults to 1000.
- repeatExpirations: set to true to emit 'expire' events for keys every `timeoutMs` milliseconds. By default, keys will be forgotten at the first 'expire' event.

The resulting object is an EventEmitter with the following functions as properties:

## touch(key)

Updates the "last touched" timestamp.  Expire events will not fire for a key until at least timeoutMs after the last time the key was touched.

## forget(key)

Forgets about a key.  Won't fire any expire events for it (unless you touch that key again).

## stop()

Shuts down any timeouts that are floating around, letting you shut down your server nicely and stuff.

License
-----
[WTFPL](http://wtfpl2.com/)
