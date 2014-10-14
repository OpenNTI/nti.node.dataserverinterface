'use strict';

var Url = require('url');

module.exports = exports = function forceHost(s) {
	//Force our config to always point to our server...(client side)
	var url = Url.parse(s);
	url.host = null;
	url.hostname = global.location.hostname;
	url.protocol = global.location.protocol;
	return url.format();
};
