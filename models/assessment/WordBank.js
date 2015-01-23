'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var parser = require('../../utils/parse-object');

function WordBank(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	Object.assign(this, data);

	this.entries = data.entries.map(e=>parser(this, e));
}

Object.assign(WordBank.prototype, base, {

	getEntry: function (id) {
		function find(found, x){
			return found || (x.wid === id && x);
		}

		return this.entries.reduce(find, null);
	}

});


module.exports = WordBank;
