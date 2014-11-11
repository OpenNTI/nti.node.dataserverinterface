'use strict';

var assign = require('object-assign');

var Question = require('./Question');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function QuestionSet(service, parent, data) {
	var me = this;
	define(me,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	assign(me, data);

	me.questions = data.questions.map(function(q) {
		return Question.parse(service, me, q);
	});
}

assign(QuestionSet.prototype, base, {
	isSubmittable: true,

	/**
	 * Checks to see if the NTIID is within this QuestionSet
	 *
	 * @param {String} id NTIID
	 */
	containsId: function(id) {
		return !!this.getQuestion(id);
	},


	getQuestion: function (id) {
		return this.questions.reduce(function(found, q) {
			return found || (q.getID() === id && q);
		}, null);
	}
});


function parse(service, parent, data) {
	return new QuestionSet(service, parent, data);
}

QuestionSet.parse = parse;

module.exports = QuestionSet;
