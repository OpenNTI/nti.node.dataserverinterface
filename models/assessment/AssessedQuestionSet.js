'use strict';

var assign = require('../../utils/assign');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var AssessedQuestion = require('./AssessedQuestion');

function AssessedQuestionSet(service, parent, data) {
	var me = this;
	define(me,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	assign(me, data);
	me.questions = data.questions.map(function(question) {
		return AssessedQuestion.parse(service, me, question);
	});
}

assign(AssessedQuestionSet.prototype, base, {

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
