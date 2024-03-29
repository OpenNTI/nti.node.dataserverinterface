import isBrowser from './browser';

const GLOBAL_PROPERTY_NAME = '%%app-data%%';
const CONTEXT_PROPERTY_NAME = Symbol.for(GLOBAL_PROPERTY_NAME);

export default class DataCache {

	constructor () {
		this.data = global[GLOBAL_PROPERTY_NAME] || {};
		delete global[GLOBAL_PROPERTY_NAME];
	}


	get(key) {
		return this.data[key];
	}


	set(key, value) {
		var o, data = this.data;
		if (typeof key === 'object') {
			o = key;
			for (key in o) {
				if (o.hasOwnProperty(key)) {
					this.set(key, o[key]);
				}
			}
		} else {
			delete data[key];//make sure to reset its configuration
			//throw if it can't be serialized, and ensure we have our own clone.
			data[key] = JSON.parse(JSON.stringify(value));
		}

		return this;
	}


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
	setVolatile (key, value) {
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
	}


	serialize () {
		return '\n<script type="text/javascript">\n' +
				'window["' + GLOBAL_PROPERTY_NAME + '"] = ' + JSON.stringify(this.data) +
				';\n</script>\n';
	}


	static getForContext (context) {
		var cache;
		if (context) {
			cache = context[CONTEXT_PROPERTY_NAME];
			if (!cache) {
				cache = context[CONTEXT_PROPERTY_NAME] = new this();
			}
		} else {
			if (!isBrowser) {
				throw new Error('There must be an active context passed if we are called on the server');
			}

			cache = this.globalInstance;
			if (!cache) {
				cache = this.globalInstance = new this();
			}
		}

		return cache;
	}
}
