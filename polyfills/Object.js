'use strict';
/* jshint -W121*/ //Allow adding to prototype of System objects

function noop(o) {return o;}

if (Object.defineProperty) {
	try {
		Object.defineProperty({}, 'foo', {value: 1});
	} catch (e) {
		//IE8 doesn't support this on non-DOM objects.
		Object.defineProperty = undefined;
	}
}


if (typeof Object.create !== 'function') {
	Object.create = (function() {
		var Object = function() {};
		return function (prototype) {
			if (arguments.length > 1) {
				throw Error('Second argument not supported');
			}
			if (typeof prototype !== 'object') {
				throw new TypeError('Argument must be an object');
			}
			Object.prototype = prototype;
			var result = {};
			Object.prototype = null;
			return result;
		};
	})();
}


// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
	Object.keys = (function() {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
		hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
		dontEnums = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
		],
		dontEnumsLength = dontEnums.length;

		return function(obj) {
			if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [], prop, i;

			for (prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (i = 0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	}());
}

if (!Object.assign) {
	Object.assign = require('object-assign');
}

if (!Object.freeze) {
	Object.freeze = noop;
}
