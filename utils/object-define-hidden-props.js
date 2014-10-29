'use strict';

var define = require('./object-define-properties');
var withValue = require('./object-attribute-withvalue');


module.exports = function defineHidden(object, props) {
	for (var p in props) {
		if (props.hasOwnProperty(p)) {
			props[p] = withValue(props[p]);
		}
	}
	return define(object, props);
};
