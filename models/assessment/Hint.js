'use strict';

var assign = require('../../utils/assign');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function Hint(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	assign(this, data);
}

assign(Hint.prototype, base, {


});


function parse(service, parent, data) {
	return new Hint(service, parent, data);
}

Hint.parse = parse;

module.exports = Hint;
