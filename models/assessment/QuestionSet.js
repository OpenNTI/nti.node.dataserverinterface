'use strict';


var Question = require('./Question');
var QuestionSetSubmission = require('./QuestionSetSubmission');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var SUBMITTED_TYPE = 'application/vnd.nextthought.assessment.assessedquestionset';

function QuestionSet(service, parent, data) {
	var me = this;
	define(me,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(me, data);

	me.questions = data.questions.map(function(q) {
		return Question.parse(service, me, q);
	});
}

Object.assign(QuestionSet.prototype, base, {
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
	},


	getQuestions: function () {
		return this.questions.slice();
	},


	getQuestionCount: function () {
		return this.questions.length;
	},


	getSubmission: function () {
		var s = QuestionSetSubmission.build(this._service, {
			questionSetId: this.getID(),
			ContainerId: this.containerId,
			CreatorRecordedEffortDuration: null,
			questions: []
		});

		s.questions = this.questions.map(function(q) {
			q = q.getSubmission();
			q.__reParent(s);
			return q;
		});

		return s;
	},


	loadPreviousSubmission: function () {
		var dataProvider = this.up('getUserDataLastOfType');
		if (!dataProvider) {
			return Promise.reject('Nothing to do');
		}

		return dataProvider.getUserDataLastOfType(SUBMITTED_TYPE);
	}
});


function parse(service, parent, data) {
	return new QuestionSet(service, parent, data);
}

QuestionSet.parse = parse;

module.exports = QuestionSet;
