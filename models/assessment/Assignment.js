'use strict';

var assign = require('../../utils/assign');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var AssignmentPart = require('./AssignmentPart');

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
			p = p.question_set;
			return p && p.getID() === id || p.containsId(id);
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
		function getQuestionFromSet(question, part) {
			return question || part.question_set.getQuestion(id);
		}
		return this.parts.reduce(getQuestionFromSet, null);
	}

});


function parse(service, parent, data) {
	return new Assignment(service, parent, data);
}

Assignment.parse = parse;

module.exports = Assignment;
