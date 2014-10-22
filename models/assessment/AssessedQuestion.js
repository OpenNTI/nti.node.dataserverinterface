'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var path = require('path');
var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var AssessedPart = require('./AssessedPart');

function AssessedQuestion(service, parent, data) {
	var me = this;
	define(me,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	merge(me, data);
	me.parts = data.parts.map(function(part) {
		return AssessedPart.parse(service, me, part);
	});
}

merge(AssessedQuestion.prototype, base, {


});


function parse(service, parent, data) {
	return new AssessedQuestion(service, parent, data);
}

AssessedQuestion.parse = parse;

module.exports = AssessedQuestion;
