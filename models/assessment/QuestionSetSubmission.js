'use strict';

var assign = require('object-assign');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function QuestionSetSubmission(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	assign(this, data);
	assign(this, {
		MimeType: 'application/vnd.nextthought.assessment.questionsetsubmission'
	});

	// CreatorRecordedEffortDuration: 0
}

assign(QuestionSetSubmission.prototype, base, {

	getQuestion: function (id) {
		return this.questions.reduce(function(found, q) {
			return found || (q.getID() === id && q);
		}, null);
	},

	countUnansweredQuestions: function () {
		return this.questions.reduce(function(sum, q) {
			return sum + (q.isAnswered() ? 0 : 1); }, 0);
	}

});


function parse(service, parent, data) {
	return new QuestionSetSubmission(service, parent, data);
}

function build(service, data) {
	return new QuestionSetSubmission(service, null, data);
}

QuestionSetSubmission.parse = parse;
QuestionSetSubmission.build = build;

module.exports = QuestionSetSubmission;
