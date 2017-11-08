[![Build Status](https://travis-ci.org/TehShrike/expire-unused-keys.svg)](https://travis-ci.org/TehShrike/expire-unused-keys)

# expire-unused-keys

So I'm writing this other library that needs to do some basic caching, right?  You know - the [first hard thing](http://martinfowler.com/bliki/TwoHardThings.html).  (For an idea of my work on the second hard thing, see the examples below.)

It's not so much that I need flotsam deleted right away when it expires as I want the value to be refreshed every so often, and if that value goes a long enough time with out being accessed, theeeeen I'll drop it.

To lessen the pain in this task, I need a library that will keep track of what the last time was when I accessed something, and alert me if a certain amount of time passes without that thing being touched.  So, making the assumption that those "somethings" can be identified by a string, and the assertion that I will need these last-access-times to persist even after reopening the screen or re-launching the process, I wrote this-here code.

It stores last-access times in a [LevelUP](https://github.com/rvagg/node-levelup) db - if you don't need persistence, throw [level-mem](https://github.com/Level/level-mem) at it.

## breaking changes: version 2.x

- Only tested with LevelUP 2.x
- Ordered arguments to the constructor are no longer accepted, you gotta pass in an object
- Emitting events on the expirer object can no longer be done as a proxy for calling the functions
- All functions return promises
- Uses Promise + Set + ES2017, polyfill/transpile as needed

# Example

```js
// Expire stuff after 15 seconds of inactivity
const expirer = new Expirer(15 * 1000, someLevelUpDb)

// Things are only interesting if they were active in the last 15 seconds
const areTheseThingsInteresting = {
	'thing1': false,
	'thing2': false
}

const activity = function(thingKey) {
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

# API

The module returns a constructor function:

```js
const expireUnusedKeys = require('expire-unused-keys')
```

## `expirer = expireUnusedKeys({ timeoutMs, db, [checkIntervalMs,] [repeatExpirations] })`

- timeoutMs: how many milliseconds the object will wait before it emits an 'expire' event for a touched key
- db: a LevelUP data store of some kind
- checkIntervalMs: right now, this library works by iterating over all keys and emitting expire events for any items that were last touched timeoutMs ago.  This value prescribes how often the keys should be iterated over.  Defaults to 1000.
- repeatExpirations: set to true to emit 'expire' events for keys every `timeoutMs` milliseconds. By default, keys will be forgotten at the first 'expire' event.

The resulting object is an EventEmitter with the following functions as properties:

## `promise = expirer.touch(key)`

Updates the "last touched" timestamp.  Expire events will not fire for a key until at least timeoutMs after the last time the key was touched.

## `promise = expirer.forget(key[, cb])`

Forgets about a key.  Won't fire any expire events for it (unless you touch that key again).

## `promise = expirer.createIfNotExists(key)`

Creates it if it doesn't exist yet. If you called `touch` on the key without calling `forget` since, this will not create the key. If you have never called `touch`, or have called `forget` since, this will update the timestamp just like calling `touch`.

*Note:* It is possible to create a race condition if you call `touch` and `createIfNotExists` around the same time on a key that doesn't exist yet. In that case, the key will be created, and the timestamp will be updated once or twice around the same time.

## `expirer.stop()`

Shuts down any timeouts that are floating around, letting you shut down your server nicely and stuff.

# Events emitted

`expirer` is an event emitter with a [better-emitter](https://github.com/TehShrike/better-emitter) interface.

All events emit a single argument: they relevant key string.

- `expire`: emits the key that should be expired
- `touch`: emits when a key is touched and its expiration time is moved out
- `forget`: emits when a key is forgotten

License
-----
[WTFPL](http://wtfpl2.com/)
