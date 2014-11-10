'use strict';

var assign = require('../../utils/assign');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function Part(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	assign(this, data);

	/*
		content <-fixRefs
		hints <-Parse
		solutions <-Parse

		explanation
		answerLabel
	*/
}

assign(Part.prototype, base, {


});


function parse(service, parent, data) {
	return new Part(service, parent, data);
}

Part.parse = parse;

module.exports = Part;
