'use strict';


var base = require('../mixins/Base');
var names = require('../mixins/CourseAndAssignmentNameResolving');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function AssignmentFeedback(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	Object.assign(this, data);
	this.__pending = [
		this.__resolveNames(service)
	];
}

Object.assign(AssignmentFeedback.prototype, base, names, {


});


function parse(service, parent, data) {
	return new AssignmentFeedback(service, parent, data);
}

AssignmentFeedback.parse = parse;

module.exports = AssignmentFeedback;
