'use strict';

var merge = require('merge');
var et = require('elementtree');

var isEmpty = require('../../utils/isempty');
var setAndEmit = require('../../utils/getsethandler');
var urlJoin = require('../../utils/urljoin');
var withValue = require('../../utils/object-attribute-withvalue');

var base = require('../mixins/Base');
var assets = require('../mixins/PresentationResources');

var VideoIndex = require('../VideoIndex');

function Package(service, data, parent) {
	Object.defineProperty(this, '_service', withValue(service));
	Object.defineProperty(this, '_parent', withValue(parent));
	merge(this, data);

	this.author = (data.DCCreator || []).join(', ');

	this.__pending = [
		this.getAsset('landing').then(setAndEmit(this, 'icon')),
		this.getAsset('thumb').then(setAndEmit(this, 'thumb'))
	];
}

merge(Package.prototype, base, assets, {

	getDefaultAssetRoot: function() {
		var root = this.root;

		if (!root) {
			console.error('No root for content package: ', this);
			return '';
		}

		return urlJoin(root, 'presentation-assets', 'webapp', 'v1');
	},


	getTableOfContents: function() {
		var toc = this.__toc;
		var cache = this._service.getDataCache();
		var cached = cache.get(this.index);

		if (!toc) {
			toc = cached ?
				Promise.resolve(cached) :
				this._service.get(this.index)
					.then(function(data) {
						cache.set(this.index, data);
						return data;
						}.bind(this));

			toc = toc.then(this.__parseXML.bind(this))
				.then(this.__cleanToCNodes.bind(this));

			this.__toc = toc;
		}


		return toc;
	},


	getVideoIndex: function() {
		var cache = this._service.getDataCache();
		var promise = this.__videoIndex;
		var service = this._service;

		function find(toc) {
			var ref = toc.find('.//reference[@type="application/vnd.nextthought.videoindex"]');
			return (ref && ref.get('href')) || Promise.reject('No Video Index');
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
						.then(get.bind(this))
						.then(this.__parseVideoIndex.bind(this, toc));
				}.bind(this));
		}

		return promise;
	},


	__parseVideoIndex: function(toc, json) {
		var vi, n, keys, keyOrder = [],
			containers, root = this.root;

		function query(tag, id) {
			return './/' + tag + '[@ntiid="' + id + '"]';
		}

		function prefix(o) {
			o.src = urlJoin(root, o.src);
			o.srcjsonp = urlJoin(root, o.srcjsonp);
			return o;
		}

		containers = (json && json.Containers) || {};
		keys = Object.keys(containers);

		try {
			keys.sort(function(a, b) {
				var c = toc.find(query('topic', a)) || toc.find(query('toc', a)),
					d = toc.find(query('topic', b)),
					p = ((c && c._id) || 0) > ((d && d._id) || 0);
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

		return VideoIndex.parse(this._service, vi, this);
	},


	__parseXML: function(string) {
		return et.parse(string);
	},


	__cleanToCNodes: function(x) {
		function remove(e) {
			var p = getParent(e);
			if (p) {
				p.remove(e);
			}
		}

		function getParent(e) {
			var key = 'ntiid',
				id = e.get(key);

			if (!id) {
				key = 'target-ntiid';
				id = e.get(key);
			}

			return x.find('*[@' + key + '="' + id + '"]/..');
		}

		var p = this.up('__cleanToCNodes');

		if (p) {
			p.__cleanToCNodes(x, remove);
		}

		return x;
	}

});



function parse(service, data, parent) {
	return new Package(service, data, parent);
}

Package.parse = parse.bind(Package);

module.exports = Package;
