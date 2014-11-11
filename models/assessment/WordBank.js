'use strict';

var assign = require('object-assign');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var WordEntry = require('./WordEntry');

function WordBank(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	assign(this, data);

	this.entries = data.entries.map(WordEntry.parse.bind(this, service, this));
}

assign(WordBank.prototype, base, {


});


function parse(service, parent, data) {
	return new WordBank(service, parent, data);
}

WordBank.parse = parse;

module.exports = WordBank;
