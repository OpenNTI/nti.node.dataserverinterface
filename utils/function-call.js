'use strict';

/**
 * Calls a function with args. If the passed function is falsy nothing happens.
 *
 * @param  {Function} fn   Function to call.
 * @param  {any...}   [args...] Varargs of paramaters.
 * @return {*}
 */
module.exports = function call(fn) {
	var params = Array.prototype.slice.call(arguments);

	params.shift();//drop the function off

	return fn && fn.apply(null, params);
};
