'use strict';

var isEmpty = require('./isempty');

module.exports = function ensureArray(a) {
	return Array.isArray(a) ? a :
		(isEmpty(a, true) ? [] : [a]);
};
