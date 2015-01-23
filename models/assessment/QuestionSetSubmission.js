'use strict';


var base = require('../mixins/Base');
var submission = require('../mixins/Submission');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var parser = require('../../utils/parse-object');

function QuestionSetSubmission(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);
	Object.assign(this, {
		MimeType: 'application/vnd.nextthought.assessment.questionsetsubmission'
	});

	// CreatorRecordedEffortDuration: 0

	this.questions = this.questions.map(q =>parser(this, q));
}

Object.assign(QuestionSetSubmission.prototype, base, submission, {

	getQuestion (id) {
		return this.questions.reduce((found, q) => found || (q.getID() === id && q), null);
	},

	getQuestions () {
		return this.questions.slice();
	},

	countUnansweredQuestions (questionSet) {
		if (!questionSet || !questionSet.questions || questionSet.questions.length !== this.questions.length) {
			throw new Error('Invalid Argument');
		}

		return this.questions.reduce((sum, q) =>
			sum + (questionSet.getQuestion(q.getID()).isAnswered(q) ? 0 : 1), 0);
	}
});

function build(service, data) {
	return new QuestionSetSubmission(service, null, data);
}

QuestionSetSubmission.build = build;

module.exports = QuestionSetSubmission;
