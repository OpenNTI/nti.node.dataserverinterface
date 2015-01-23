'use strict';


var base = require('../mixins/Base');
var names = require('../mixins/CourseAndAssignmentNameResolving');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

function Grade(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	Object.assign(this, data);

	this.__pending = [
		this.__resolveNames(service)
	];
}

Object.assign(Grade.prototype, base, names, {

	getValue () {
		return this.value;
	},

	isExcused () {
		return !!this.IsExcused;
	}
});


module.exports = Grade;
