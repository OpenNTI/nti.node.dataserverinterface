'use strict';

var assign = require('object-assign');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var AssignmentPart = require('./AssignmentPart');
var AssignmentSubmission = require('./AssignmentSubmission');

function parseDate(me, key) {
	var v = me[key];
	if (!v) {
		return;
	}

	var d = new Date(v);
	//if not equal to the input...
	//toISOString includes millies, drop the millies
	if (d.toISOString().replace(/\.\d+/,'') !== v) {
		throw new Error('Bad Date Parse');
	}

	me[key] = d;
}


function Assignment(service, parent, data) {
	var me = this;
	define(me,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	assign(me, data);

	parseDate(me, 'available_for_submission_beginning');
	parseDate(me, 'available_for_submission_ending');

	me.parts = data.parts.map(function(p) {
		return AssignmentPart.parse(service, me, p);
	});
}


assign(Assignment.prototype, base, {
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
	}

});


function parse(service, parent, data) {
	return new Assignment(service, parent, data);
}

Assignment.parse = parse;

module.exports = Assignment;
