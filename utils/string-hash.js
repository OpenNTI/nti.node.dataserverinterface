'use strict';

var isEmpty = require('./isempty');

module.exports = exports = function hash(str) {
	var h = 0, i, c;
	if (isEmpty(str)) {
		return h;
	}

	for (i = 0; i < str.length; i++) {
		c = str.charCodeAt(i);
		/* jshint -W016 */
		h = ((h << 5) - h) + c;
		h = h & h; // Convert to 32bit integer
	}
	return h;
};
