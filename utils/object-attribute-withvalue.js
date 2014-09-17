'use strict';

module.exports = function withValue(value) {
	return {
		enumerable: false,
		writable: false,
		configurable: false,
		value: value
	};
};
