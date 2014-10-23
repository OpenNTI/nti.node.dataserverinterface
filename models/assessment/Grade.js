'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var path = require('path');
var merge = require('merge');

var base = require('../mixins/Base');
var names = require('../mixins/CourseAndAssignmentNameResolving');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

function Grade(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	merge(this, data);

	this.__pending = [
		this.__resolveNames(service)
	];
}

merge(Grade.prototype, base, names, {


});


function parse(service, parent, data) {
	return new Grade(service, parent, data);
}

Grade.parse = parse;

module.exports = Grade;
