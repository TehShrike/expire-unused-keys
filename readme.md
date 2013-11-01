expire-unused-keys
=====

Want to expire some resource after a certain amount of inactivity?  Check this shizzle out.

Example 
-----

```js

    // Expire stuff after 15 seconds of inactivity
    var expirer = new Expirer(15) 

    // Things are only interesting if they were active in the last 15 seconds
	var areTheseThingsInteresting = {
		'thing1': false,
		'thing2': false
	}

	var activity = function(thingKey) {
		areTheseThingsInteresting[thingKey] = true

		// note that this thing was interacted with
		expirer.emit('touch', thingKey)
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
-----

The module returns a constructor function.  Pass how many seconds of inactivity it takes for something to expire.  The resulting object is an EventEmitter.

When a resource (identified by a string) is used, emit a touch event on the instantiated Expirer, passing in the string that identifies your resource.

After enough time goes by without a resource being used, the instantiated Expirer will emit an "expire" event, passing in the expired resource's string as an argument.  You can then drop that resource out of the cache, or whatever it is that you're doing, you sexy beast you.

License
-----
[WTFPL](http://wtfpl2.com/)
