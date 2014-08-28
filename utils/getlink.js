'use strict';

var fn = module.exports = function getLink(o, rel, raw) {

	if (o && o.Links) { o = o.Links; }

	var v, i = o.length - 1;
	for (i; i>=0; i--) {
		v = o[i];
		if (v && v.rel === rel) {
			return raw === true ? v : v.href;
		}
	}
};


fn.asMap = function(o) {
	if (o && o.Links) { o = o.Links; }
	if (!Array.isArray(o)) {
		o = [o];
	}

	var m = {};
	var v, i = o.length - 1;
	for (i; i>=0; i--) {
		v = o[i];
		if (m[v.rel]) {console.warn('There are more than one instances of %s', v.rel);}
		m[v.rel] = v.href;
	}

	return m;
};
