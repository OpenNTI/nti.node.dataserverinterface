'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

function WordEntry(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});
	Object.assign(this, data);
}

Object.assign(WordEntry.prototype, base, {


});


module.exports = WordEntry;
