var result;
var net = require('net');

if (typeof net.connect === 'function') {
	result = require('request');
} else {
	result = function() {

	};
}


module.exports = result;
