'use strict';

module.exports = exports = function isThenable(maybeThenable) {
	return maybeThenable && (
		maybeThenable instanceof Promise ||
		maybeThenable.then
	);
};
