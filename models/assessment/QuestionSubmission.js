'use strict';


var base = require('../mixins/Base');
var submission = require('../mixins/Submission');

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

Object.assign(QuestionSubmission.prototype, base, submission, {

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


	addRecordedEffortTime: function (/*duration*/) {
		// var old = this.CreatorRecordedEffortDuration || 0;
		// this.CreatorRecordedEffortDuration = old + duration;

		//Force/Blank this out for now.
		this.CreatorRecordedEffortDuration = null;
	},


	canSubmit: function() {
		function answered(p) { return p !== null; }

		if (this.isSubmitted()) {return false;}

		return this.parts.filter(answered).length > 0;
	}
});


function build(service, data) {
	return new QuestionSubmission(service, null, data);
}

QuestionSubmission.build = build;

module.exports = QuestionSubmission;
