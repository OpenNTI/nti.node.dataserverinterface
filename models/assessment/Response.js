'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function Response(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);
}

Object.assign(Response.prototype, base, {


});


function parse(service, parent, data) {
	return new Response(service, parent, data);
}

Response.parse = parse;

module.exports = Response;
