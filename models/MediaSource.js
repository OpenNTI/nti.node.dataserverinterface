'use strict';

var define = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');
//var isEmpty = require('../utils/isempty');


function MediaSource(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);
}

Object.assign(MediaSource.prototype, {

});


function parse(service, parent, data) {
	return new MediaSource(service, parent, data);
}


//Static defs
MediaSource.parse = parse;

module.exports = MediaSource;
