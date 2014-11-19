'use strict';


var base = require('../mixins/Base');
var content = require('../mixins/HasContent');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function Hint(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);
	content.initMixin.call(this, data, ['value']);
}

Object.assign(Hint.prototype, base, content, {

});


function parse(service, parent, data) {
	return new Hint(service, parent, data);
}

Hint.parse = parse;

module.exports = Hint;
