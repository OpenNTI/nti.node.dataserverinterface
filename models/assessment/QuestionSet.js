'use strict';

var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function QuestionSet(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	merge(this, data);
}

merge(QuestionSet.prototype, base, {
	isSubmittable: true
});


function parse(service, parent, data) {
	return new QuestionSet(service, parent, data);
}

QuestionSet.parse = parse;

module.exports = QuestionSet;
