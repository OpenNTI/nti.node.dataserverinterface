'use strict';

var merge = require('merge');
var et = require('elementtree');

var setAndEmit = require('../../utils/getsethandler');
var unique = require('../../utils/array-unique');
var urlJoin = require('../../utils/urljoin');
var withValue = require('../../utils/object-attribute-withvalue');

var base = require('../mixins/Base');
var assets = require('../mixins/PresentationResources');

function Package(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	merge(this, data);

	this.author = (data.DCCreator || []).join(', ');

	this.__pending = [
		this.getAsset('landing').then(setAndEmit(this, 'icon')),
		this.getAsset('thumb').then(setAndEmit(this, 'thumb')),
		this.getTableOfContents()
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
						}.bind(this));

			toc = toc.then(this.__parseXML.bind(this))
				.then(this.__cleanToCNodes.bind(this));
		}


		return toc;
	},



	__parseXML: function(string) {
		return et.parse(string);
	},


	__cleanToCNodes: function(x) {
		function strip(e) {
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

		function getAllNodesReferencingContentID(ntiid, xml) {
			if (!xml || !ntiid) {
				return [];
			}

			function getNodesForKey(keys) {
				var nodes = [];

				keys.forEach(function(k) {
					nodes = unique(nodes.concat(xml.findall('*[@' + k + '="' + ntiid + '"]')));
				});

				return nodes;
			}

			return getNodesForKey(['ntiid', 'target-ntiid']);
		}

		function permitOrRemove(e) {
			console.debug('TODO:... filter TOC')
			/*var status = CourseWareUtils.getEnrollmentStatus(ntiid);
			if (!ContentUtils.hasVisibilityForContent(e, status)) {
				getAllNodesReferencingContentID(e.get('target-ntiid'), x).forEach(strip);
			}*/
		}

		var ntiid = this.NTIID;
		x.findall('*[@visibility]')
			.forEach(permitOrRemove);


		return x;
	}

});



function parse(service, data) {
	return new Package(service, data);
}

Package.parse = parse.bind(Package);

module.exports = Package;
