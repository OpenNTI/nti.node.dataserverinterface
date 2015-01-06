'use strict';

var values = require('./object-values');

module.exports = function(o, val) {
	var v = o && values(o) || false;//force falsy to become literal False
	return v && v.indexOf(val) > -1;
};
