'use strict';

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var parser = require('../../utils/parse-object');

var SUBMITTED_TYPE = 'application/vnd.nextthought.assessment.assessedquestionset';

function QuestionSet(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);

	this.questions = data.questions.map(q=>parser(this, q));
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
		let Model = parser.getModel('assessment.questionsetsubmission');
		var s = Model.build(this._service, {
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
		var dataProvider = this.parent('getUserDataLastOfType');
		if (!dataProvider) {
			return Promise.reject('Nothing to do');
		}

		return dataProvider.getUserDataLastOfType(SUBMITTED_TYPE);
	}
});


module.exports = QuestionSet;
