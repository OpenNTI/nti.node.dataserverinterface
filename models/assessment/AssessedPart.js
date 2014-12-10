'use strict';


var base = require('../mixins/Base');
var assessed = require('../mixins/AssessedAssessmentPart');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var parseKey = require('../../utils/parse-object-at-key');


function AssessedPart(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);

	parseKey(this, 'solutions');
}

Object.assign(AssessedPart.prototype, base, assessed, {


	getQuestionId: function() {
		return this._parent.getID();
	},


	getPartIndex: function() {
		return this._parent.parts.indexOf(this);
	},


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
