'use strict';

var assign = require('object-assign');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function AssignmentSubmission(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	assign(this, data);
	assign(this, {
		MimeType: 'application/vnd.nextthought.assessment.assignmentsubmission'
	});

	// CreatorRecordedEffortDuration: 0
}

assign(AssignmentSubmission.prototype, base, {

	getQuestion: function (id) {
		return this.parts.reduce(function(found, p) {
			return found || p.getQuestion(id);
		}, null);
	},


	countUnansweredQuestions: function () {
		return this.parts.reduce(function(sum, q) {
			return sum + q.countUnansweredQuestions(); }, 0);
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
