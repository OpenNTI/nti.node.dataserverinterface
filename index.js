var Session = require('./session');
var Interface = require('./interface');

module.exports = function(config) {
	'use strict';
	var i = new Interface(config);

	return {
		interface: i,
		session: new Session(i)
	};
};
