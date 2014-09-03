'use strict';

var EventEmitter = require('events').EventEmitter;
var merge = require('merge');
var urlJoin = require('../../utils/urljoin');
var withValue = require('../../utils/object-attribute-withvalue');

var Bundle = require('../content/Bundle');

function Instance(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	Object.defineProperty(this, '_server', withValue(service.getServer()));
	merge(this, data);

	var b = Bundle.parse(service, data.ContentPackageBundle);
	this.ContentPackageBundle = b;
	b.on('changed', this.onChange.bind(this));
}

merge(Instance.prototype, EventEmitter.prototype, {

	getPresentationProperties: function() {
		return this.ContentPackageBundle;
	},


	onChange: function(who) {
		this.emit('changed', this, who);
	}

});



function parse(service, data) {
	return new Instance(service, data);
}

Instance.parse = parse.bind(Instance);

module.exports = Instance;
