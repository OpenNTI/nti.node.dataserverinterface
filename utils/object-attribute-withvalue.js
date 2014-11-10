'use strict';

module.exports = function withValue(value, enumerable) {
	return {
		enumerable: enumerable || false,
		writable: false,
		configurable: false,
		value: value
	};
};
