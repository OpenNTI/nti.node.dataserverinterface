'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function QuestionSubmission(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);
	Object.assign(this, {
		MimeType: 'application/vnd.nextthought.assessment.questionsubmission'
	});

	// questionId
	// parts -> parse
	// CreatorRecordedEffortDuration: 0
}

Object.assign(QuestionSubmission.prototype, base, {

	getID: function() {
		return this.NTIID || this.questionId;
	},


	getPartValue: function (index) {
		return this.parts[index];
	},


	setPartValue: function (index, value) {
		index = parseInt(index, 10);
		if (index < 0 || index >= this.parts.length) {
			throw new Error('Index Out Of Bounds.');
		}

		this.parts[index] = value;
	},


	isAnswered: function() {
		function answered(p) { return p !== null; }

		var expect = this.parts.length;

		return this.parts.filter(answered).length === expect;
	},


	canSubmit: function() {
		function answered(p) { return p !== null; }
		return this.parts.filter(answered).length > 0;
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
	return new QuestionSubmission(service, parent, data);
}

function build(service, data) {
	return new QuestionSubmission(service, null, data);
}

QuestionSubmission.parse = parse;
QuestionSubmission.build = build;

module.exports = QuestionSubmission;
