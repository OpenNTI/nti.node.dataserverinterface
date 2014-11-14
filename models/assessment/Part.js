'use strict';

var assign = require('object-assign');

var base = require('../mixins/Base');
var content = require('../mixins/HasContent');

var WordBank = require('./WordBank');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function Part(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	assign(this, data);

	content.initMixin.call(this, data, this.__contentProperties);

	if (this.wordbank) {
		this.wordbank = WordBank.parse(service, this, this.wordbank);
	}

	/*
		hints <-Parse
		solutions <-Parse
	*/
}

assign(Part.prototype, base, content, {
	__contentProperties: ['content', 'explanation', 'answerLabel'],

	getQuestionId: function() {
		return this._parent.getID();
	},


	getPartIndex: function() {
		return this._parent.parts.indexOf(this);
	}
});


function parse(service, parent, data) {
	return new Part(service, parent, data);
}

Part.parse = parse;

module.exports = Part;
