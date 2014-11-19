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
		var vi, n, keys, keyOrder = [],
			containers, root = this.root;

		function prefix(o) {
			o.src = urlJoin(root, o.src);
			o.srcjsonp = urlJoin(root, o.srcjsonp);
			return o;
		}

		containers = (json && json.Containers) || {};
		keys = Object.keys(containers);

		try {
			keys.sort(function(a, b) {
				var c = toc.getSortPosition(a),
					d = toc.getSortPosition(b),
					p = c > d;
				return p ? 1 : -1;
			});
		} catch (e) {
			console.warn('Potentially unsorted:', e.stack || e.message || e);
		}

		keys.forEach(function(k) {
			keyOrder.push.apply(keyOrder, containers[k]);
		});

		vi = (json && json.Items) || json;
		for (n in vi) {
			if (vi.hasOwnProperty(n)) {
				n = vi[n];
				if (n && !isEmpty(n.transcripts)) {
					n.transcripts = n.transcripts.map(prefix);
				}
			}
		}

		vi._order = keyOrder;

		return VideoIndex.parse(this._service, this, vi);
	}


});



function parse(service, parent, data) {
	return new Package(service, parent, data);
}

Package.parse = parse;

module.exports = Package;
