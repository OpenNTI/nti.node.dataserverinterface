'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var path = require('path');
var merge = require('merge');

var base = require('../../mixins/Base');

var define = require('../../../utils/object-define-properties');
var withValue = require('../../../utils/object-attribute-withvalue');

var AssignmentPart = require('./AssignmentPart');

function Assignment(service, parent, data) {
	var me = this;
	define(me,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	merge(me, data);
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
	}

});


function parse(service, parent, data) {
	return new Assignment(service, parent, data);
}

Assignment.parse = parse.bind(Assignment);

module.exports = Assignment;
