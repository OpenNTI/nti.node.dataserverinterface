'use strict';

module.exports = function withValue(value, enumerable) {
	return value && {
		enumerable: enumerable || false,
		writable: false,
		configurable: true,
		value: value
	};
};
