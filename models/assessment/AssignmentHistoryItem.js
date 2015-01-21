'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var parser = require('../../utils/parse-object');

function AssignmentHistoryItem(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);

	for(let prop of ['Feedback','Grade','Submission','pendingAssessment']) {
		this[prop] = data[prop] && parser(this, data[prop]);
	}
}


Object.assign(AssignmentHistoryItem.prototype, base, {


	getQuestions: function () {
		var submission = this.pendingAssessment || this.Submission;
		return submission ? submission.getQuestions() : [];
	},


	isSubmitted: function () {
		return !!this.Submission;
	},


	isGradeExcused () {
		var g = this.Grade || false;
		return g && g.isExcused();
	},


	getGradeValue: function () {
		var g = this.Grade;
		return g && g.getValue();
	}

});


function parse(service, parent, data) {
	return new AssignmentHistoryItem(service, parent, data);
}

AssignmentHistoryItem.parse = parse;

module.exports = AssignmentHistoryItem;
