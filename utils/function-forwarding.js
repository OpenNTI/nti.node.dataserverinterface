'use strict';

function reflect(fn, key) {

	return function() {
		var a = this[key] || [];
		return a[fn].apply(a, arguments);
	};
}


/**
 * binds functions from the object at the given key so they can be added to an
 * upper object. (ex: map an array's forEach (bound) to the wrapping object)
 *
 * @param  {Array[String]} fns An array of function names to bind and return
 * @param  {String} key The key where the object is at.
 * @return {Object}	Object with function names to bound functions
 */
module.exports = function forwardFunctions(fns, key) {
	var result = {};

	fns.forEach(function(fn) {
		result[fn] = reflect(fn, key);
	})

	return result;
};
