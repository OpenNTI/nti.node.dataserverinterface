'use strict';


module.exports = function(str) {
	var o = {};
	console.error('[DEPRECATED] use `query-string`');

	for(let v of (str || '').split(/[\?&]/)) {

		if (v && v.length) {
			v = v.split(/=/).map(decodeURIComponent);
			o[v[0]] = v[1];
		}
	}

	return o;
};
