'use strict';

var isBrowser = require('./browser');

var globalKey = '%%app-data%%';

function DataCache() {
	this.data = global[globalKey] || {};
	delete global[globalKey];
}


DataCache.prototype.get = function get(key) {
	return this.data[key];
};


DataCache.prototype.set = function set(key, value) {
	var o;
	if (typeof key === 'object') {
		o = key;
		for (key in o) {
			if (o.hasOwnProperty(key)) {
				this.set(key, o[key]);
			}
		}
	} else {
		//throw if it can't be serialized, and ensure we have our own clone.
		this.data[key] = JSON.parse(JSON.stringify(value));
	}

	return this;
};


/**
 * Sets a "volatile" value into the cache. The value will be ignored when the
 * cache is serialized.  This allows for caching instances of objects that
 * should not be serialized but need to be cached.
 *
 * @param {String/Object} key   The key to assign the value to. Optionally this
 *                              can be an Object of keys and values.
 * @param {*} value A value to cache. If `key` is an object, this paramater is
 *                  ignored.
 */
DataCache.prototype.setVolatile = function setVolatile(key, value) {
	var o;
	if (typeof key === 'object') {
		o = key;
		for (key in o) {
			if (o.hasOwnProperty(key)) {
				this.setVolatile(key, o[key]);
			}
		}
	} else {
		Object.defineProperty(this.data, key, {
			enumerable: false,
			writable: true,
			configurable: true,
			value: value
		});
	}

	return this;
};


DataCache.prototype.serialize = function ToScriptTag() {
	return '\n<script type="text/javascript">\n' +
			'window["' + globalKey + '"] = ' + JSON.stringify(this.data) +
			';\n</script>\n';
};


DataCache.getForContext = function getForContext(context) {
	var cache;
	if (context) {
		cache = context[globalKey];
		if (!cache) {
			cache = context[globalKey] = new DataCache();
		}
	} else {
		if (!isBrowser) {
			throw new Error('There must be an active context passed if we are called on the server');
		}

		cache = this.globalInstance;
		if (!cache) {
			cache = this.globalInstance = new DataCache();
		}
	}

	return cache;
};

module.exports = DataCache;
