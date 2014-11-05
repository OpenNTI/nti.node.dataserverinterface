'use strict';

var hits = {};

module.exports = function(instance, maxCount) {
	var key = instance.constructor.toString();
	var c = hits[key] = (hits[key] || 0) + 1;

	if (c >= maxCount) {
		throw new Error('Instance tracked more times than allowed.');
	}
};
