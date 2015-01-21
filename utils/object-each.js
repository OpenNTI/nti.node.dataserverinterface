'use strict';

module.exports = function each(object, f) {
	for(let key of Object.keys(object)) {
		f(object[key], key, object);
	}
	return object;
};
