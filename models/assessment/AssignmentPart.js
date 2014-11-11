'use strict';

var assign = require('object-assign');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var QuestionSet = require('./QuestionSet');

function AssignmentPart(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	assign(this, data);
	this.question_set = QuestionSet.parse(service, this, this.question_set);
}

assign(AssignmentPart.prototype, base, {


});


function parse(service, parent, data) {
	return new AssignmentPart(service, parent, data);
}

AssignmentPart.parse = parse;

module.exports = AssignmentPart;
