'use strict';


var base = require('../mixins/Base');
var assessed = require('../mixins/AssessedAssessmentPart');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var parser = require('../../utils/parse-object');

function AssessedQuestionSet(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	Object.assign(this, data);
	this.questions = data.questions.map(question=>parser(this, question));
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

module.exports = AssessedQuestionSet;
