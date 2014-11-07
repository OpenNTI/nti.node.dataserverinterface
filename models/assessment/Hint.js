'use strict';

var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function Hint(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	merge(this, data);
}

merge(Hint.prototype, base, {


});


function parse(service, parent, data) {
	return new Hint(service, parent, data);
}

Hint.parse = parse;

module.exports = Hint;
