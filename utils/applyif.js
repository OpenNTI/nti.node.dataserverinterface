'use strict';

module.exports = function (dest, src) {
	for(var i in src) {
		if (src.hasOwnProperty(i)) {
			if (dest[i] == null) {//intentional "== null"
				dest[i] = src[i];
			}
		}
	}
	return dest;
};
