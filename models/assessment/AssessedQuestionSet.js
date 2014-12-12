'use strict';


var base = require('../mixins/Base');
var assessed = require('../mixins/AssessedAssessmentPart');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var AssessedQuestion = require('./AssessedQuestion');

function AssessedQuestionSet(service, parent, data) {
	var me = this;
	define(me,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	Object.assign(me, data);
	me.questions = data.questions.map(function(question) {
		return AssessedQuestion.parse(service, me, question);
	});
}

Object.assign(AssessedQuestionSet.prototype, base, assessed, {

	getQuestion: function (id) {
		return this.questions.reduce(function(found, q) {
			return found || (q.getID() === id && q);
		}, null);
	},


	getQuestions: function () {
		return this.questions.slice();
	},


	isSubmitted: function () {
		return true;
	},


	getTotal: function () {
		return (this.questions || []).length;
	},


	getCorrect: function() {
		function addCorrect(sum, question) {
			if (question.isCorrect()) {
				sum++;
			}
			return sum;
		}
		return (this.questions || []).reduce(addCorrect, 0);
	},


	getIncorrect: function () {
		return this.getTotal() - this.getCorrect();
	},


	getScore: function() {
		try {
			return 100 * (this.getCorrect() / this.getTotal());
		} catch (e) {
			return 0;
		}
	}
});


function parse(service, parent, data) {
	return new AssessedQuestionSet(service, parent, data);
}

AssessedQuestionSet.parse = parse;

module.exports = AssessedQuestionSet;
