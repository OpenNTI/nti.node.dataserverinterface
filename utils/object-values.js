'use strict';

module.exports = function (o) {
	return o && Object.keys(o).map(function(key) {return o[key];});
};
