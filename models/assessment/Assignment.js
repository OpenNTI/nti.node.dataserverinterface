'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var AssignmentPart = require('./AssignmentPart');
var AssignmentSubmission = require('./AssignmentSubmission');
var AssignmentHistoryItem = require('./AssignmentHistoryItem');
var SavePointItem = require('./SavePointItem');


function Assignment(service, parent, data) {
	var me = this;
	define(me,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(me, data);

	me.__parseDate('available_for_submission_beginning');
	me.__parseDate('available_for_submission_ending');

	me.parts = data.parts.map(function(p) {
		return AssignmentPart.parse(service, me, p);
	});
}


Object.assign(Assignment.prototype, base, {
	isSubmittable: true,


	is: function(id) {
		return this.getID() === id || this.containsId(id);
	},

	/**
	 * Checks to see if the NTIID is within this Assignment (Checking the QuestionSet's id and all questions id's)
	 *
	 * @param {String} id NTIID
	 */
	containsId: function(id) {
		var items = this.parts.filter(function(p) {
			return p.containsId(id);
		});
		return items.length > 0;
	},


	isLate: function(date) {
		return date > this.available_for_submission_ending;
	},


	getDueDate: function() {
		return this.available_for_submission_ending;
	},


	getQuestion: function (id) {
		function get(question, part) {
			return question || part.getQuestion(id);
		}
		return this.parts.reduce(get, null);
	},


	getQuestions: function () {
		function get(list, part) {
			return list.concat(part.getQuestions());
		}
		this.parts.reduce(get, []);
	},


	getQuestionCount: function () {
		function sum(agg, part) {
			return agg + part.getQuestionCount();
		}
		return this.parts.reduce(sum, 0);
	},


	getSubmission: function () {
		var s = AssignmentSubmission.build(this._service, {
			assignmentId: this.getID(),
			parts: []
		});

		s.parts = this.parts.map(function(p) {
			return p.getSubmission();
		});

		return s;
	},


	loadPreviousSubmission: function () {
		return this.loadHistory()
			.catch(this.loadSavePoint.bind(this));
	},


	loadHistory: function () {
		var me = this;
		var service = me._service;
		var link = me.getLink('History');

		if (!link) {
			return Promise.reject('No Link');
		}

		return service.get(link)
			.then(function(data) {
				return AssignmentHistoryItem.parse(service, me, data);
			});
	},


	loadSavePoint: function() {
		var me = this;
		var service = me._service;
		var link = me.getLink('Savepoint');

		if (!link) {
			return Promise.reject('No Link');
		}

		return service.get(link)
			.then(function(data) {
				return SavePointItem.parse(service, me, data);
			});
	},


	postSavePoint: function (data) {
		var link = this.getLink('Savepoint');
		if (!link) {
			return Promise.resolve({});
		}

		return this._service.post(link, data);
	}

});


function parse(service, parent, data) {
	return new Assignment(service, parent, data);
}

Assignment.parse = parse;

module.exports = Assignment;
