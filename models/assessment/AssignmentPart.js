'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var path = require('path');
var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var QuestionSet = require('./QuestionSet');

function AssignmentPart(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	merge(this, data);
	this.question_set = QuestionSet.parse(service, this, this.question_set);
}

merge(AssignmentPart.prototype, base, {


});


function parse(service, parent, data) {
	return new AssignmentPart(service, parent, data);
}

AssignmentPart.parse = parse;

module.exports = AssignmentPart;
