'use strict';

var assign = require('../../utils/assign');

var base = require('../mixins/Base');
var content = require('../mixins/HasContent');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var parseObject = require('../../utils/parse-object');

var WordBank = require('./WordBank');

function Question(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	assign(this, data);
	
	content.initMixin.call(this, data);


	this.parts = data.parts.map(parseObject.bind(this, this));

	if (this.wordbank) {
		this.wordbank = WordBank.parse(service, this, this.wordbank);
	}
}

assign(Question.prototype, base, content, {

});


function parse(service, parent, data) {
	return new Question(service, parent, data);
}

Question.parse = parse;

module.exports = Question;
