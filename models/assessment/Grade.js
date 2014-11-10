'use strict';

var assign = require('../../utils/assign');

var base = require('../mixins/Base');
var names = require('../mixins/CourseAndAssignmentNameResolving');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

function Grade(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	assign(this, data);

	this.__pending = [
		this.__resolveNames(service)
	];
}

assign(Grade.prototype, base, names, {


});


function parse(service, parent, data) {
	return new Grade(service, parent, data);
}

Grade.parse = parse;

module.exports = Grade;
