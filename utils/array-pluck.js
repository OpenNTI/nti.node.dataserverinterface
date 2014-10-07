'use strict';

var cache = {};

/*jshint -W054*/
function getPlucker(i) {
	if (!cache[i]) {
		cache[i] = new Function('o','return o["'+i+'"];');
	}
	return cache[i];
}

module.exports = function arrayPluck(array, property) {
	return Array.isArray(array) &&
		array.map(getPlucker(property));
};
