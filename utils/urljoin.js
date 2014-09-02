'use strict';

var Path = require('path');
var Url = require('url');

module.exports = function urlJoin() {
	var parts = Array.prototype.slice.call(arguments);
	var url = Url.parse(parts.shift());

	parts.unshift(url.pathname);

	function toString(i) { return !i ? '': i.toString(); }

	url.pathname = Path.join.apply(Path, parts.map(toString));

	return url.format();
};
