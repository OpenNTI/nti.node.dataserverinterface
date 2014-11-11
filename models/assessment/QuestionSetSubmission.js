'use strict';

var assign = require('object-assign');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function QuestionSetSubmission(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	assign(this, data);
	// questionSetId
	// questions -> parse
}

assign(QuestionSetSubmission.prototype, base, {


});


function parse(service, parent, data) {
	return new QuestionSetSubmission(service, parent, data);
}

QuestionSetSubmission.parse = parse;

module.exports = QuestionSetSubmission;
