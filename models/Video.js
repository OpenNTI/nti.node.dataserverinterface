'use strict';

var merge = require('merge');
var withValue = require('../utils/object-attribute-withvalue');


function Video(service, data, parent) {
	Object.defineProperty(this, '_service', withValue(service));
	Object.defineProperty(this, '_parent', withValue(parent));

	merge(this, data);
}

merge(Video.prototype, {


});



function parse(service, data, parent) {
	if (data instanceof Video) {
		return data;
	}

	return new Video(service, data, parent);
}

Video.parse = parse.bind(Video);

module.exports = Video;
