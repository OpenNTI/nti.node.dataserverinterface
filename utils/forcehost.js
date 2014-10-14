'use strict';

var Url = require('url');

module.exports = exports = function forceHost(s) {
	//Force our config to always point to our server...(client side)
	var url = Url.parse(s);
	url.host = global.location.host;
	url.hostname = global.location.hostname;
	url.protocol = global.location.protocol;
	url.port = global.location.port;
	return url.format();
};
