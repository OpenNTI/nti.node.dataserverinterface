'use strict';

var EventEmitter = require('events').EventEmitter;
var merge = require('merge');
var assets = require('./mixins/PresentationResources');
var withValue = require('../../utils/object-attribute-withvalue');

function Bundle(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	Object.defineProperty(this, '_server', withValue(service.getServer()));
	merge(this, data);

	var me = this;
	this.getAsset('landing').then(function(url) {
		me.icon = url;
		me.emit('changed');
	});

	this.getAsset('thumb').then(function(url) {
		me.thumb = url;
		me.emit('changed');
	});
}

merge(Bundle.prototype, assets, EventEmitter.prototype, {

});



function parse(service, data) {
	return new Bundle(service, data);
}

Bundle.parse = parse.bind(Bundle);

module.exports = Bundle;
