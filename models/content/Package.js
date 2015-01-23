'use strict';



var isEmpty = require('../../utils/isempty');
var setAndEmit = require('../../utils/getsethandler');
var urlJoin = require('../../utils/urljoin');
var withValue = require('../../utils/object-attribute-withvalue');

var base = require('../mixins/Base');
var define = require('../../utils/object-define-properties');
var assets = require('../mixins/PresentationResources');

var VideoIndex = require('../VideoIndex');
var ToC = require('../XMLBasedTableOfContents');

function Package(service, parent, data) {
	define(this, {
		_service: withValue(service),
		_parent: withValue(parent)
	});
	Object.assign(this, data);

	this.author = (data.DCCreator || []).join(', ');

	this.__pending = [
		this.getAsset('landing').then(setAndEmit(this, 'icon')),
		this.getAsset('thumb').then(setAndEmit(this, 'thumb'))
	];
}

Object.assign(Package.prototype, base, assets, {

	getDefaultAssetRoot: function() {
		var root = this.root;

		if (!root) {
			console.error('No root for content package: ', this);
			return '';
		}

		return urlJoin(root, 'presentation-assets', 'webapp', 'v1');
	},


	getTableOfContents: function() {
		var me = this;
		var toc = me.__toc;
		var cache = me._service.getDataCache();
		var cached = cache.get(me.index);

		if (!toc) {
			toc = cached ?
				Promise.resolve(cached) :
				me._service.get(me.index)
					.then(function(data) {
						cache.set(me.index, data);
						return data;
					});

			toc = toc.then(function(o){return ToC.parse(me._service, me, o);});

			me.__toc = toc;
		}


		return toc;
	},


	getVideoIndex: function() {
		var cache = this._service.getDataCache();
		var promise = this.__videoIndex;
		var service = this._service;

		function find(toc) {
			return toc.getVideoIndexRef() || Promise.reject('No Video Index');
		}

		function get(url) {
			var cached = cache.get(url);
			if (cached) {
				return cached;
			}

			return service.get(url)
				.then(function (data) {
					cache.set(url, data);
					return data;
				});
		}


		if (!promise) {
			this.__videoIndex = promise = this.getTableOfContents()
				.then(function(toc) {
					return Promise.resolve(toc)
						.then(find)
						.then(urlJoin.bind(this, this.root))
						.then(get)
						.then(this.__parseVideoIndex.bind(this, toc));
				}.bind(this));
		}

		return promise;
	},


	__parseVideoIndex: function(toc, json) {
		var keyOrder = [];
		var root = this.root;

		function prefix(o) {
			o.src = urlJoin(root, o.src);
			o.srcjsonp = urlJoin(root, o.srcjsonp);
			return o;
		}

		function tocOrder(a, b) {
			// Since the <[topic|object] ntiid="..." is not guaranteed to be unique,
			// this will just order by first occurance of any element that has an
			// ntiid attribute with value of what is asked for (a & b)
			var c = toc.getSortPosition(a),
				d = toc.getSortPosition(b),
				p = c > d;
			return p ? 1 : -1;
		}

		let containers = (json && json.Containers) || {};
		let keys = Object.keys(containers);

		try {
			keys.sort(tocOrder);
		} catch (e) {
			console.warn('Potentially unsorted: %o', e.stack || e.message || e);
		}

		keys.forEach(k => keyOrder.push(...containers[k]));

		let vi = (json && json.Items) || json;

		for (let n in vi) {
			if (vi.hasOwnProperty(n)) {
				n = vi[n];
				if (n && !isEmpty(n.transcripts)) {
					n.transcripts = n.transcripts.map(prefix);
				}
			}
		}

		return VideoIndex.parse(this._service, this, vi, keyOrder);
	}


});

module.exports = Package;
