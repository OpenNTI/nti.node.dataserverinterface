'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var WordEntry = require('./WordEntry');

function WordBank(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	Object.assign(this, data);

	this.entries = data.entries.map(WordEntry.parse.bind(this, service, this));
}

Object.assign(WordBank.prototype, base, {

	getEntry: function (id) {
		function find(found, x){
			return found || (x.wid === id && x);
		}

		return this.entries.reduce(find, null);
	}

});


function parse(service, parent, data) {
	return new WordBank(service, parent, data);
}

WordBank.parse = parse;

module.exports = WordBank;
