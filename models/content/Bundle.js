'use strict';

var setAndEmit = require('../../utils/getsethandler');
var urlJoin = require('../../utils/urljoin');

var forwardFunctions = require('../../utils/function-forwarding');
var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var base = require('../mixins/Base');
var assets = require('../mixins/PresentationResources');
var Package = require('./Package');

var TablesOfContents = require('../TablesOfContents');

function Bundle(service, parent, data) {
	define(this, {
		_service: withValue(service),
		_parent: withValue(parent)
	});
	Object.assign(this, data);

	this.author = (data.DCCreator || []).join(', ');

	var pending = this.__pending = [];

	this.ContentPackages = this.ContentPackages.map(pkg => {
		pkg = Package.parse(service, this, pkg);
		pkg.on('changed', this.onChange.bind(this));
		pending.push.apply(pending, pkg.__pending || []);
		return pkg;
	});

	pending.push(
		this.getAsset('landing').then(setAndEmit(this, 'icon')),
		this.getAsset('thumb').then(setAndEmit(this, 'thumb')),
		this.getAsset('background').then(setAndEmit(this, 'background')));
}

Object.assign(Bundle.prototype, base, assets,
	forwardFunctions(['every','filter','forEach','map','reduce'], 'ContentPackages'), {
	isBundle: true,

	getDefaultAssetRoot () {
		var root = ([this].concat(this.ContentPackages))
				.reduce((agg, o) => agg || o.root, null);

		if (!root) {
			console.error('No root for bundle: ',
				this.getID(),
				this.ContentPackages.map(o => o.getID())
				);
			return '';
		}

		return urlJoin(root, 'presentation-assets', 'webapp', 'v1');
	},


	getTablesOfContents () {

		return Promise.all(this.ContentPackages.map(p =>
			p.getTableOfContents().then(t => ({ id: p.getID(), toc: t }))))

			.then(tables => {
				var result = tables.slice();

				tables.forEach((v, i) =>
					result[v.id] = result[i] = v.toc);

				return new TablesOfContents(this._service, this, result);
			});
	}

});



function parse(service, parent, data) {
	return new Bundle(service, parent, data);
}

Bundle.parse = parse;

module.exports = Bundle;
