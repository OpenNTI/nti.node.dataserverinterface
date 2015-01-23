'use strict';


var base = require('./mixins/Base');

var define = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');
var parser;

function parseObject(o, data) {
	//because Parser requires this model (PageInfo), we can't put this ref
	//at the top... build will fail. So we will pull the ref on demand
	if(!parser) {
		parser = require('./Parser');
	}
	return parser(o._service, o, data);
}



function Change(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);

	this.Item = parseObject(this, data.Item);

	this.__pending = this.Item.__pending || [];
}

Object.assign(Change.prototype, base, {

});

module.exports = Change;
