'use strict';

var EventEmitter = require('events').EventEmitter;
var merge = require('merge');
var urlJoin = require('../../utils/urljoin');
var withValue = require('../../utils/object-attribute-withvalue');
var assets = require('../mixins/PresentationResources');
var Package = require('./Package');

function Bundle(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	Object.defineProperty(this, '_server', withValue(service.getServer()));
	merge(this, data);

	this.author = (data.DCCreator || []).join(', ');

	this.ContentPackages = this.ContentPackages.map(function(pkg) {
		pkg = Package.parse(service, pkg);
		pkg.on('changed', this.onChange.bind(this));
		return pkg;
	}.bind(this));

	var me = this;
	this.getAsset('landing').then(function(url) {
		me.icon = url;
		me.emit('changed', me);
	});

	this.getAsset('thumb').then(function(url) {
		me.thumb = url;
		me.emit('changed', me);
	});


	this.getAsset('background').then(function(url) {
		me.background = url;
		me.emit('changed', me);
	});
}

merge(Bundle.prototype, assets, EventEmitter.prototype, {
	isBundle: true,


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
