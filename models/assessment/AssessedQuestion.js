'use strict';


var base = require('../mixins/Base');
var assessed = require('../mixins/AssessedAssessmentPart');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var parser = require('../../utils/parse-object');

function AssessedQuestion(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	Object.assign(this, data);
	this.parts = data.parts.map(part =>parser(this, part));
}

Object.assign(AssessedQuestion.prototype, base, assessed, {

	getID: function () {
		return this.questionId || this.NTIID;
	},


	isCorrect: function() {
		var p = this.parts || [],
			i = p.length - 1, v;

		for (i; i >= 0; i--) {
			v = p[i].isCorrect();
			if (!v) {
				return v;
			}
		}

		return true;
	},
});


module.exports = AssessedQuestion;
