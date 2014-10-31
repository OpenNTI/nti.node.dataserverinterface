'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');
var withValue = require('../utils/object-attribute-withvalue');

var Enrollment = function(service) {
	Object.defineProperty(this, '_service', withValue(service));
}

merge(Enrollment.prototype, {
	enrollOpen: function(courseid) {
		console.debug(courseid);
	}
})

module.exports = Enrollment;

