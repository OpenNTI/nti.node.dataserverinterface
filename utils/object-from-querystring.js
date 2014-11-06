'use strict';

module.exports = function fromQueryString(str) {
	var o = {};
	(str || '').split(/[\?&]/).forEach(function(v) {
		if (v && v.length) {
			v = v.split(/=/).map(decodeURIComponent);
			o[v[0]] = v[1];
		}
	});
	return o;
};
