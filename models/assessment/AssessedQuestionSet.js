'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var path = require('path');
var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var AssessedQuestion = require('./AssessedQuestion');

function AssessedQuestionSet(service, parent, data) {
	var me = this;
	define(me,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	merge(me, data);
	me.questions = data.questions.map(function(question) {
		return AssessedQuestion.parse(service, me, question);
	});
}

merge(AssessedQuestionSet.prototype, base, {


});


function parse(service, parent, data) {
	return new AssessedQuestionSet(service, parent, data);
}

AssessedQuestionSet.parse = parse.bind(AssessedQuestionSet);

module.exports = AssessedQuestionSet;