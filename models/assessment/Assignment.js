'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var path = require('path');
var merge = require('merge');

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

	merge(me, data);

	parseDate(me, 'available_for_submission_beginning');
	parseDate(me, 'available_for_submission_ending');

	me.parts = data.parts.map(function(p) {
		return AssignmentPart.parse(service, me, p);
	});
}

merge(Assignment.prototype, base, {

	is: function(id) {
		return this.getID() === id || this.containsId(id);
	},


	containsId: function(id) {
		var items = this.parts.filter(function(p) {
			p = p.question_set;
			return p && p.getID() === id;
		});

		return items.length > 0;
	},


	isLate: function(date) {
		return date > this.available_for_submission_ending;
	},


	getDueDate: function() {
		return this.available_for_submission_ending;
	}

});


function parse(service, parent, data) {
	return new Assignment(service, parent, data);
}

Assignment.parse = parse;

module.exports = Assignment;
