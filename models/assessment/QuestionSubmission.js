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
	// CreatorRecordedEffortDuration: 0
}

assign(QuestionSubmission.prototype, base, {
	MimeType: 'application/vnd.nextthought.assessment.questionsubmission'
});


function parse(service, parent, data) {
	return new QuestionSubmission(service, parent, data);
}

function build(service, data) {
	return new QuestionSubmission(service, null, data);
}

QuestionSubmission.parse = parse;
QuestionSubmission.build = build;

module.exports = QuestionSubmission;
