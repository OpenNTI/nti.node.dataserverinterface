'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');
var withValue = require('../utils/object-attribute-withvalue');
var isEmpty = require('../utils/isempty');


function MediaSource(service, data, parent) {
	Object.defineProperty(this, '_service', withValue(service));
	Object.defineProperty(this, '_parent', withValue(parent));

	merge(this, data);
}

merge(MediaSource.prototype, {

});


function parse(service, data, parent) {
	return new MediaSource(service, data, parent);
}


//Static defs
MediaSource.parse = parse.bind(MediaSource);

module.exports = MediaSource;
