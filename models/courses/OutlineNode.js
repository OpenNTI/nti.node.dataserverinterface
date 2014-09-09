'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');

var base = require('../mixins/Base');

var withValue = require('../../utils/object-attribute-withvalue');


function OutlineNode(service, parent, data) {
	Object.defineProperty(this, '_service', withValue(service));
	Object.defineProperty(this, '_parent', withValue(parent));
	merge(this, data);

	this.contents = this.contents.map(parse.bind(this, service, this));
}

merge(OutlineNode.prototype, base, {


});



function parse(service, parent, data) {
	if (Array.isArray(data)) {
		return data.map(parse.bind(this, service, parent));
	}
	return new OutlineNode(service, parent, data);
}

OutlineNode.parse = parse.bind(OutlineNode);

module.exports = OutlineNode;
