'use strict';

var merge = require('merge');
var base = require('./mixins/Base');

var withValue = require('../utils/object-attribute-withvalue');

function PageInfo(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	merge(this, data);
}


merge(PageInfo.prototype, base, {


});



function parse(service, data) {
	return new PageInfo(service, data);
}

PageInfo.parse = parse.bind(PageInfo);

module.exports = PageInfo;
