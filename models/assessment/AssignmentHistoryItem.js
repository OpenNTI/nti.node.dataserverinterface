'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var parser = require('../../utils/parse-object');

function AssignmentHistoryItem(service, parent, data) {
	var me = this;
	define(me,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(me, data);

	['Feedback','Grade','Submission','pendingAssessment']
		.forEach(function(prop) {
			me[prop] = data[prop] && parser(me, data[prop]);
		});
}


Object.assign(AssignmentHistoryItem.prototype, base, {

	getQuestions: function () {
		return this.Submission ? this.Submission.getQuestions() : [];
	},


	isSubmitted: function () {
		return !!this.Submission;
	}

});


function parse(service, parent, data) {
	return new AssignmentHistoryItem(service, parent, data);
}

AssignmentHistoryItem.parse = parse;

module.exports = AssignmentHistoryItem;
