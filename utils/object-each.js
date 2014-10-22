'use strict';

module.exports = function each(object, f) {
	Object.keys(object).forEach(function(key) {
		f(object[key], key, object);
	});
	return object;
};
