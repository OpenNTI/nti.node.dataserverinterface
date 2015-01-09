'use strict';

var parser = require('./parse-object');

exports = module.exports = function parseKey(object, key) {
	var value = object[key];

	value = object[key] = parser(object, value);

	if (!value || value.length === 0) {
		delete object[key];
	}
};
