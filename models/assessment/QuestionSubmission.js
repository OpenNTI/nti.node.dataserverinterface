'use strict';

var assign = require('object-assign');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function QuestionSubmission(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	assign(this, data);
	// questionId
	// parts -> parse
}

assign(QuestionSubmission.prototype, base, {


});


function parse(service, parent, data) {
	return new QuestionSubmission(service, parent, data);
}

QuestionSubmission.parse = parse;

module.exports = QuestionSubmission;
