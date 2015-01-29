function reflect(fn, key) {

	return function(...args) {
		//`this` needs to be the object the returned
		// function is injected into, _not_ a job for
		// the arrow function
		return (this[key] || [])[fn](...args);
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
export default function forwardFunctions(fns, key) {
	var result = {};

	for(let fn of fns) {
		result[fn] = reflect(fn, key);
	}

	return result;
}
