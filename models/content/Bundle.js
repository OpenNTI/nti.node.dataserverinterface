'use strict';

var EventEmitter = require('events').EventEmitter;
var merge = require('merge');
var setAndEmit = require('../../utils/getsethandler');
var urlJoin = require('../../utils/urljoin');
var withValue = require('../../utils/object-attribute-withvalue');
var assets = require('../mixins/PresentationResources');
var Package = require('./Package');

function Bundle(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	merge(this, data);

	this.author = (data.DCCreator || []).join(', ');

	var pending = this.__pending = [];

	this.ContentPackages = this.ContentPackages.map(function(pkg) {
		pkg = Package.parse(service, pkg);
		pkg.on('changed', this.onChange.bind(this));
		pending.push.apply(pending, pkg.__pending || []);
		return pkg;
	}.bind(this));

	pending.push(
		this.getAsset('landing').then(setAndEmit(this, 'icon')),
		this.getAsset('thumb').then(setAndEmit(this, 'thumb')),
		this.getAsset('background').then(setAndEmit(this, 'background')));
}

merge(Bundle.prototype, assets, EventEmitter.prototype, {
	isBundle: true,

	getID: function() {
		return this.NTIID;
	},
	

	onChange: function(who) {
		this.emit('changed', this, who);
	},


	getDefaultAssetRoot: function() {
		var root = ([this].concat(this.ContentPackages))
				.reduce(function(agg, o) { return agg || o.root; }, null);

		if (!root) {
			console.error('No root for bundle: ', this);
			return '';
		}

		return urlJoin(root, 'presentation-assets', 'webapp', 'v1');
	}

});



function parse(service, data) {
	return new Bundle(service, data);
}

Bundle.parse = parse.bind(Bundle);

module.exports = Bundle;
