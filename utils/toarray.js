'use strict';
/*jshint -W054*/
exports = module.exports =
	new Function('a', 'return a?Array.prototype.slice.call(a):[];');
