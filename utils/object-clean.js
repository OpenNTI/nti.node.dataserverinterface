'use strict';
module.exports = function clean(o) {
	var key, v;

	if (!o || !(o instanceof Object)) {return o;}

	for (key in o) {
		if (o.hasOwnProperty(key)) {
			v = o[key];
			if (v instanceof Object) {
				clean(v);
				if (Object.keys(v).length === 0) {
					v = null;
				}
			}

			if (!v) {//remove falsy values
				delete o[key];
			}


		}
	}

	return o;
};
