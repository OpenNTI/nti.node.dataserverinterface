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

	this.questions = this.questions.map(function(q) {

		return parser(this, q);

	}.bind(this));
}

Object.assign(QuestionSetSubmission.prototype, base, submission, {

	getQuestion: function (id) {
		return this.questions.reduce(function(found, q) {
			return found || (q.getID() === id && q);
		}, null);
	},

	getQuestions: function () {
		return this.questions.slice();
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
