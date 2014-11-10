'use strict';

var assign = require('../../utils/assign');

var base = require('../mixins/Base');
var content = require('../mixins/HasContent');


var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function Part(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	content.initMixin.call(this, data);

	assign(this, data);

	/*
		hints <-Parse
		solutions <-Parse

		explanation
		answerLabel
	*/
}

assign(Part.prototype, base, content, {


});


function parse(service, parent, data) {
	return new Part(service, parent, data);
}

Part.parse = parse;

module.exports = Part;
