'use strict';

var isFunction = require('./isfunction');


module.exports = exports = function autoBind(object, allowPrototype) {
	var key, prop;
	for(key in object) {
		if (allowPrototype || object.hasOwnProperty(key)) {
			prop = object[key];
			if(isFunction(prop)) {
				object[key] = prop.bind(object);
			}
		}
	}

	return object;
};
