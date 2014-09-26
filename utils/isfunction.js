'use strict';

//var getClass = {}.toString;

//See: http://jsperf.com/alternative-isfunction-implementations/4
module.exports = exports = function isFunction(object) {
	//Very SLOW:
	//return object && getClass.call(object) === '[object Function]';

	//Very FAST:
	return typeof(object) === 'function';
};
