'use strict';
var Promise = global.Promise || require('es6-promise').Promise;

var Url = require('url');
var merge = require('merge');
var getLink = require('../../utils/getlink');
var urlJoin = require('../../utils/urljoin');
var waitFor = require('../../utils/waitfor');
var pluck = require('../../utils/array-pluck');
var withValue = require('../../utils/object-attribute-withvalue');

var base = require('../mixins/Base');
var VideoIndex = require('../VideoIndex');
var Bundle = require('../content/Bundle');
var CatalogEntry = require('./CatalogEntry');
var Outline = require('./OutlineNode');

function Instance(service, data, parent) {
	Object.defineProperty(this, '_service', withValue(service));
	Object.defineProperty(this, '_parent', withValue(parent));
	merge(this, data);

	var b = this.ContentPackageBundle = Bundle.parse(service, data.ContentPackageBundle, this);

	b.on('changed', this.onChange.bind(this));

	this.__pending = [

		this._resolveCatalogEntry()

	].concat(b.__pending || []);
}

merge(Instance.prototype, base, {
	isCourse: true,


	getPresentationProperties: function() {
		var cce = this.CatalogEntry || {getAuthorLine: function(){}},
			bundle = this.ContentPackageBundle;

		return {
			author: cce.getAuthorLine() || bundle.author,
			title: cce.Title || bundle.title,
			label: cce.ProviderUniqueID,
			icon: cce.icon || bundle.icon,
			thumb: cce.thumb || bundle.thumb
		};
	},


	_resolveCatalogEntry: function() {

		function parseCCE(cce) {
			cce = CatalogEntry.parse(service, cce);
			this.CatalogEntry = cce;
			return waitFor(cce.__pending);
		}

		function cacheIt(data) {
			cache.set(url, data);
			return data;
		}

		var service = this._service,
			cache = service.getDataCache(),
			url = getLink(this, 'CourseCatalogEntry'),
			cached = cache.get(url), work;

		if (cached) {
			work = Promise.resolve(cached);
		} else {
			work = service.get(url).then(cacheIt);
		}

		return work.then(parseCCE.bind(this));
	},


	getOutline: function() {
		var link = getLink(this.Outline || {}, 'contents');
		if (!link) {
			return Promise.reject('No Outline or content link');
		}

		if (!this.__outline) {
			this.__outline = this._service.get(link)
				.then(function(contents) {
					var o = Outline.parse(this._service, this, this.Outline);
					o.contents = Outline.parse(this._service, o, contents);
					return o;
				}.bind(this));
		}
		return this.__outline;
	},


	getOutlineNode: function (id) {
		return this.getOutline()
			.then(function(outline) {
				return outline.__getNode(id) ||
						Promise.reject('Outline Node not found');
			});
	},


	getVideoIndex: function() {
		var service = this._service;

		function get(pkg) {
			return pkg.getVideoIndex().then(function(ix) {return ix.asJSON();});
		}

		function flattenMap(o, i) {return merge(o, i);}
		function flattenList(o, i) {return o.concat(i);}

		function combine(indices) {
			var orders = pluck(indices, '_order');
			var out = indices.reduce(flattenMap, {});
			out._order = orders.reduce(flattenList, []);
			return VideoIndex.parse(service, out, this);
		}
		
		return Promise.all(this.ContentPackageBundle.map(get)).then(combine.bind(this));
	},


	resolveContentURL: function(url) {
		var bundle = this.ContentPackageBundle;
		var pkg = ((bundle && bundle.ContentPackages) || [])[0];//probably should search all packages...

		var root = Url.parse(pkg.root);

		return Promise.resolve(root.resolve(url));
	}
});



function parse(service, data, parent) {
	return new Instance(service, data, parent);
}


Instance.parse = parse.bind(Instance);

module.exports = Instance;
