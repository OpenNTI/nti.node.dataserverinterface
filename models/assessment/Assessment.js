'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function Assessment(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	Object.assign(this, data);
}

Object.assign(Assessment.prototype, base, {


});


function parse(service, parent, data) {
	return new Assessment(service, parent, data);
}

Assessment.parse = parse;

module.exports = Assessment;
