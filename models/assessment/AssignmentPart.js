'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var parser = require('../../utils/parse-object');

function AssignmentPart(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);
	this.question_set = parser(this, this.question_set);
}

Object.assign(AssignmentPart.prototype, base, {

	containsId: function(id) {
		var qSet = this.question_set;
		return qSet && (qSet.getID() === id || qSet.containsId(id));
	},

	getQuestion: function (id) {
		return this.question_set.getQuestion(id);
	},


	getQuestions: function () {
		return this.question_set.getQuestions();
	},


	getQuestionCount: function () {
		return this.question_set.getQuestionCount();
	},


	getSubmission: function () {
		return this.question_set.getSubmission();
	}

});


module.exports = AssignmentPart;
