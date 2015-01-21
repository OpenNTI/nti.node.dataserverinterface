'use strict';


var base = require('../mixins/Base');
var submission = require('../mixins/Submission');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var parser = require('../../utils/parse-object');


function AssignmentSubmission(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);
	Object.assign(this, {
		MimeType: 'application/vnd.nextthought.assessment.assignmentsubmission'
	});

	this.parts = this.parts.map(function(part) {

		return parser(this, part);

	}.bind(this));

	// CreatorRecordedEffortDuration: 0
}

Object.assign(AssignmentSubmission.prototype, base, submission, {

	getQuestion: function (id) {
		return this.parts.reduce(function(found, p) {
			return found || p.getQuestion(id);
		}, null);
	},


	getQuestions: function () {
		return this.parts.reduce(function(list, p) {
			return list.concat(p.getQuestions());
		}, []);
	},


	countUnansweredQuestions: function (assignment) {
		//Verify argument is an Assignment model
		if (!assignment || !assignment.parts || assignment.parts.length !== this.parts.length) {
			throw new Error('Invalid Argument');
		}

		return this.parts.reduce((sum, q, i) =>
			sum + q.countUnansweredQuestions(assignment.parts[i].question_set), 0);
	}
});


function parse(service, parent, data) {
	return new AssignmentSubmission(service, parent, data);
}

function build(service, data) {
	return new AssignmentSubmission(service, null, data);
}

AssignmentSubmission.parse = parse;
AssignmentSubmission.build = build;

module.exports = AssignmentSubmission;
