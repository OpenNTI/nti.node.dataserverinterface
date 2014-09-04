'use strict';

var EventEmitter = require('events').EventEmitter;
var merge = require('merge');
var setAndEmit = require('../../utils/getsethandler');
var urlJoin = require('../../utils/urljoin');
var withValue = require('../../utils/object-attribute-withvalue');
var assets = require('../mixins/PresentationResources');

function Package(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	merge(this, data);

	this.author = (data.DCCreator || []).join(', ');

	this.__pending = [
		this.getAsset('landing').then(setAndEmit(this, 'icon')),
		this.getAsset('thumb').then(setAndEmit(this, 'thumb'))
	];
}

merge(Package.prototype, assets, EventEmitter.prototype, {

	getDefaultAssetRoot: function() {
		var root = this.root;

		if (!root) {
			console.error('No root for content package: ', this);
			return '';
		}

		return urlJoin(root, 'presentation-assets', 'webapp', 'v1');
	}

});



function parse(service, data) {
	return new Package(service, data);
}

Package.parse = parse.bind(Package);

module.exports = Package;
