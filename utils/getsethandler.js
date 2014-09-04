'use strict';

module.exports = function getSetHandler(scope, property, silent) {
	return function(v) {
		var old = scope[property];
		scope[property] = v;
		if (scope.emit && silent !== true) {
			scope.emit('changed', scope, property, v, old);
		}
	};
};
