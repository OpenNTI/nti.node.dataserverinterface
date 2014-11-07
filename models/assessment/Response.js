'use strict';

var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function Response(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	merge(this, data);
}

merge(Response.prototype, base, {


});


function parse(service, parent, data) {
	return new Response(service, parent, data);
}

Response.parse = parse;

module.exports = Response;
