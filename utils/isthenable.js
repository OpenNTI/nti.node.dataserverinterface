'use strict';
var Promise = global.Promise || require('es6-promise').Promise;

module.exports = exports = function isThenable(maybeThenable) {
	return maybeThenable && (
		maybeThenable instanceof Promise ||
		maybeThenable.then
	);
};
