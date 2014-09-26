'use strict';

var merge = require('merge');
var base = require('./mixins/Base');

var withValue = require('../utils/object-attribute-withvalue');

function PageInfo(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	merge(this, data);
}


merge(PageInfo.prototype, base, {

	getContent: function() {
		return this._service.get(this.getLink('content'));
	}

});



function parse(service, data) {
	return new PageInfo(service, data);
}

PageInfo.parse = parse.bind(PageInfo);

module.exports = PageInfo;
