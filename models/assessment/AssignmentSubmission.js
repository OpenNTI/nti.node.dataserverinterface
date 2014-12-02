'use strict';


var base = require('../mixins/Base');

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

Object.assign(AssignmentSubmission.prototype, base, {

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


	countUnansweredQuestions: function () {
		return this.parts.reduce(function(sum, q) {
			return sum + q.countUnansweredQuestions(); }, 0);
	},


	canSubmit: function() {
		return this.parts.reduce(function(can, q) {
			return can || q.canSubmit(); }, false);
	},


	submit: function() {
		var target = (this._service.getCollectionFor(this) || {}).href;
		if (!target) {
			console.error('No where to save object: %o', this);
		}

		return this._service.post(target, this.getData());
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
