'use strict';

module.exports = function withValue(value) {
	var d = withValue.d || (
	withValue.d = {
		enumerable: false,
		writable: false,
		configurable: false,
		value: null
	});
	d.value = value;
	return d;
};
