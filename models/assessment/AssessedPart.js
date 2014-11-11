'use strict';

var assign = require('object-assign');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function AssessedPart(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	assign(this, data);
}

assign(AssessedPart.prototype, base, {

	isCorrect: function() {
		var a = this.assessedValue;
		//true, false, or null (if the assessedValue is not a number, return null)
		return typeof a === 'number' ? a === 1 : null;
	}
});


function parse(service, parent, data) {
	return new AssessedPart(service, parent, data);
}

AssessedPart.parse = parse;

module.exports = AssessedPart;
