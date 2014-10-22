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
var AssessmentCollection = require('../assessment/Collection');

function Instance(service, parent, data) {
	Object.defineProperty(this, '_service', withValue(service));
	Object.defineProperty(this, '_parent', withValue(parent));
	merge(this, data);

	var b = this.ContentPackageBundle = Bundle.parse(service, this, data.ContentPackageBundle);

	b.on('changed', this.onChange.bind(this));

	this.__pending = [

		this._resolveCatalogEntry(),
		this.getAssignments()

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
			me.CatalogEntry = cce;
			return waitFor(cce.__pending);
		}

		function cacheIt(data) {
			cache.set(url, data);
			return data;
		}

		var me = this,
			service = me._service,
			cache = service.getDataCache(),
			url = getLink(me, 'CourseCatalogEntry'),
			cached = cache.get(url), work;

		if (cached) {
			work = Promise.resolve(cached);
		} else {
			work = service.get(url).then(cacheIt);
		}

		return work.then(parseCCE);
	},


	//Should only show assignments if there is an AssignmentsByOutlineNode link
	shouldShowAssignments: function() {
		return !!this.getLink('AssignmentsByOutlineNode');
	},


	getAssignments: function() {
		var toc;
		var key = '__getAssignments';
		var me = this;
		var i = me._service;
		var p = me[key];


		// A/B sets... Assignments are the Universe-Set minus the B set.
		// The A set is the assignmetns you can see.
		var A = me.getLink('AssignmentsByOutlineNode');
		var B = me.getLink('NonAssignmentAssessmentItemsByOutlineNode');

		if (!me.shouldShowAssignments()) {
			return Promise.reject('No Assignments');
		}

		if (!p) {
			toc = this.ContentPackageBundle.getTablesOfContents();
			p = me[key] = Promise.all([ i.get(A), i.get(B), toc ])
				.then(function(a) {
					return AssessmentCollection.parse(i, me, a[0], a[1], a[2]);
				});
		}

		return p;
	},


	getOutline: function() {
		var link = getLink(this.Outline || {}, 'contents');
		if (!link) {
			return Promise.reject('No Outline or content link');
		}

		if (!this.__outline) {
			this.__outline = Promise.all([
					this._service.get(link),
					this.getAssignments().catch(function(){})
				])
				.then(function(contents) {
					var o = Outline.parse(this._service, this, this.Outline);

					Object.defineProperty(o, '_assignments', withValue(contents[1]));

					o.contents = Outline.parse(this._service, o, contents[0]);
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
		var me = this;

		function get(pkg) {
			return pkg.getVideoIndex().then(function(ix) {return ix.asJSON();});
		}

		function flattenList(o, i) {return o.concat(i);}

		function combine(indices) {
			var orders = pluck(indices, '_order');
			var out = indices.reduce(merge, {});
			out._order = orders.reduce(flattenList, []);
			return VideoIndex.parse(service, me, out);
		}

		return Promise.all(this.ContentPackageBundle.map(get)).then(combine);
	},


	resolveContentURL: function(url) {
		var bundle = this.ContentPackageBundle;
		var pkg = ((bundle && bundle.ContentPackages) || [])[0];//probably should search all packages...

		var root = Url.parse(pkg.root);

		return Promise.resolve(root.resolve(url));
	}
});



function parse(service, parent, data) {
	return new Instance(service, parent, data);
}


Instance.parse = parse.bind(Instance);

module.exports = Instance;
