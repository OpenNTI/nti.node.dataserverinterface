'use strict';

var merge = require('merge');
var urlJoin = require('../../utils/urljoin');
var withValue = require('../../utils/object-attribute-withvalue');
var forwardFunctions = require('../utils/function-forwarding');
var base = require('../mixins/Base');

var Instance = require('./Instance');

function Enrollment(service, data, admin) {
	Object.defineProperty(this, '_service', withValue(service));

	merge(this, data);

	var i = this.CourseInstance = Instance.parse(service, data.CourseInstance);

	i.on('changed', this.onChange.bind(this));

	this.__pending = [].concat(i.__pending || []);
}

merge(Enrollment.prototype, base,
	forwardFunctions([
		'getPresentationProperties',
		'getOutline'

		//From:
	], 'CourseInstance'), {

	isCourse: true,


	getCourseID: function() {
		return this.CourseInstance.getID();
	}

});



function parse(service, data, admin) {
	return new Enrollment(service, data, admin);
}

Enrollment.parse = parse.bind(Enrollment);

module.exports = Enrollment;
