'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var path = require('path');
var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function Question(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	merge(this, data);
}

merge(Question.prototype, base, {

});


function parse(service, parent, data) {
	return new Question(service, parent, data);
}

Question.parse = parse;

module.exports = Question;
