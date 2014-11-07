'use strict';

var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function QuestionSubmission(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	merge(this, data);
	// questionId
	// parts -> parse
}

merge(QuestionSubmission.prototype, base, {


});


function parse(service, parent, data) {
	return new QuestionSubmission(service, parent, data);
}

QuestionSubmission.parse = parse;

module.exports = QuestionSubmission;
