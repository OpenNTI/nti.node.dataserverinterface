'use strict';
var isEmpty = require('./isempty');

exports = module.exports = function(a) {
	return isEmpty(a) ? [] :
		Array.isArray(a) ? a :
			Array.prototype.slice.call(a);
};
