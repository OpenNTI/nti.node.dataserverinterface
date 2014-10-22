'use strict';

var merge = require('merge');
var setAndEmit = require('../../utils/getsethandler');
var urlJoin = require('../../utils/urljoin');

var forwardFunctions = require('../../utils/function-forwarding');
var withValue = require('../../utils/object-attribute-withvalue');

var base = require('../mixins/Base');
var assets = require('../mixins/PresentationResources');
var Package = require('./Package');

var TablesOfContents = require('../TablesOfContents');

function Bundle(service, parent, data) {
	Object.defineProperty(this, '_service', withValue(service));
	Object.defineProperty(this, '_parent', withValue(parent));
	merge(this, data);

	this.author = (data.DCCreator || []).join(', ');

	var pending = this.__pending = [];

	this.ContentPackages = this.ContentPackages.map(function(pkg) {
		pkg = Package.parse(service, this, pkg);
		pkg.on('changed', this.onChange.bind(this));
		pending.push.apply(pending, pkg.__pending || []);
		return pkg;
	}.bind(this));

	pending.push(
		this.getAsset('landing').then(setAndEmit(this, 'icon')),
		this.getAsset('thumb').then(setAndEmit(this, 'thumb')),
		this.getAsset('background').then(setAndEmit(this, 'background')));
}

merge(Bundle.prototype, base, assets,
	forwardFunctions(['every','filter','forEach','map','reduce'], 'ContentPackages'), {
	isBundle: true,

	getDefaultAssetRoot: function() {
		var root = ([this].concat(this.ContentPackages))
				.reduce(function(agg, o) { return agg || o.root; }, null);

		if (!root) {
			console.error('No root for bundle: ',
				this.getID(),
				this.ContentPackages.map(function(o){return o.getID();})
				);
			return '';
		}

		return urlJoin(root, 'presentation-assets', 'webapp', 'v1');
	},


	getTablesOfContents: function() {
		var me = this;
		return Promise.all(this.ContentPackages.map(function(p) {
			return p.getTableOfContents().then(function(t){
				return { id: p.getID(), toc: t }; });
		}))
			.then(function (tables){
				var result = tables.slice();

				tables.forEach(function(v, i, a) {
					result[v.id] = result[i] = v.toc; });

				return new TablesOfContents(me._service, me, result);
			});
	}

});



function parse(service, parent, data) {
	return new Bundle(service, parent, data);
}

Bundle.parse = parse.bind(Bundle);

module.exports = Bundle;
