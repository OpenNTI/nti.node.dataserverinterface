var Session = require('./session');
var Interface = require('./interface');
var cache = require('./utils/datacache');

module.exports = function(config) {
	'use strict';
	var i = new Interface(config);

	return {
		datacache: cache,
		interface: i,
		session: new Session(i)
	};
};
