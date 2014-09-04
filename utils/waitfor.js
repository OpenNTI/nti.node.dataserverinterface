'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

function neverFail(thenable) {
	var x = function() {};
	return thenable.then(x, x);
}

module.exports =  function(pending, timeout) {

	if (!Array.isArray(pending)) {
		pending = [Promise.resolve(pending)];
	}

	return new Promise(function(resolve, reject) {

		function onTimeout() {
			resolve = function() {};
			reject('Timeout');
		}

		if (timeout) {
			timeout = setTimeout(onTimeout, timeout);
		}

		Promise.all(pending.map(neverFail)).then(function() {
			// Do not pass the resolve function reference to "then"...
			// otherwize it won't be able to be ignored after timeout.
			resolve();
		});
	});
};
