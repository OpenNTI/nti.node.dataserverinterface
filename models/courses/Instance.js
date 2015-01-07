'use strict';

var Url = require('url');
var getLink = require('../../utils/getlink');

var waitFor = require('../../utils/waitfor');
var pluck = require('../../utils/array-pluck');
var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var parseKey = require('../../utils/parse-object-at-key');
var emptyFunction = require('../../utils/empty-function');

var base = require('../mixins/Base');
var VideoIndex = require('../VideoIndex');
var Bundle = require('../content/Bundle');
var CatalogEntry = require('./CatalogEntry');
var Outline = require('./OutlineNode');
var AssessmentCollection = require('../assessment/Collection');

var emptyCatalogEntry = {getAuthorLine: emptyFunction};

function Instance(service, parent, data) {
	define(this, {
		_service: withValue(service),
		_parent: withValue(parent)
	});
	Object.assign(this, data);

	var b = this.ContentPackageBundle = Bundle.parse(service, this, data.ContentPackageBundle);

	b.on('changed', this.onChange.bind(this));


	var parse = parseKey.bind(this, this);
	parse('ParentDiscussions');
	parse('Discussions');

	this.__pending = [

		resolveCatalogEntry(this)

	].concat(b.__pending || []);
}

Object.assign(Instance.prototype, base, {
	isCourse: true,


	getPresentationProperties: function() {
		var cce = this.CatalogEntry || emptyCatalogEntry,
			bundle = this.ContentPackageBundle;

		return {
			author: cce.getAuthorLine() || bundle.author,
			title: cce.Title || bundle.title,
			label: cce.ProviderUniqueID,
			icon: cce.icon || bundle.icon,
			thumb: cce.thumb || bundle.thumb
		};
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
					return new AssessmentCollection(i, me, a[0], a[1], a[2]);
				});
		}

		return p;
	},


	getDiscussions: function () {
		var NOT_DEFINED = {reason: 'Not defined'};
		function contents(o) {
			return o ? o.getContents() : Promise.reject(NOT_DEFINED);
		}

		function logAndResume(reason) {
			if (reason !== NOT_DEFINED) {
				console.warn('Could not load board: %o', reason);
			}
		}

		function getId(o) {
			return o ? o.getID(): null;
		}

		var sectionId = getId(this.Discussions);
		var parentId = getId(this.ParentDiscussions);

		return Promise.all([
			contents(this.Discussions).catch(logAndResume),
			contents(this.ParentDiscussions).catch(logAndResume)
		]).then(function(data) {
			var section = data[0];
			var parent = data[1];

			section.NTIID = sectionId;
			parent.NTIID = parentId;

			return binDiscussions(section, parent);
		});
	},


	getOutline: function() {
		var me = this;
		var link = getLink(this.Outline || {}, 'contents');
		if (!link) {
			return Promise.reject('No Outline or content link');
		}

		function buildOutline(contents) {
			var o = Outline.parse(me._service, me, me.Outline);

			define(o, {_assignments: withValue(contents[1])});

			o.contents = Outline.parse(me._service, o, contents[0]);
			return o;
		}

		if (!this.__outline) {
			this.__outline = waitFor(this.__pending)
				.then(function () {
					return me.CatalogEntry.Preview ?
						Promise.reject('Preview') :
						Promise.all([
							me._service.get(link),
							me.getAssignments().catch(emptyFunction) ])
						.then(buildOutline);
				});
		}
		return me.__outline;
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
			var out = indices.reduce(function(a,b){return Object.assign(a,b);}, {});
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


Instance.parse = parse;

module.exports = Instance;

//Private methods

function resolveCatalogEntry(me) {

	function parseCCE(cce) {
		cce = CatalogEntry.parse(service, cce);
		me.CatalogEntry = cce;
		return waitFor(cce.__pending);
	}

	function cacheIt(data) {
		cache.set(url, data);
		return data;
	}

	var service = me._service,
	cache = service.getDataCache(),
	url = getLink(me, 'CourseCatalogEntry'),
	cached = cache.get(url), work;

	if (cached) {
		work = Promise.resolve(cached);
	} else {
		work = service.get(url).then(cacheIt);
	}

	return work.then(parseCCE);
}


/**
 * Takes two arrays of forums and bins then
 *
 *	1.) by for credit or open
 *	2.) by if they are for this section or the parent
 *
 * returns an object that looks like:
 *
 *	{
 *		ForCredit: {
 *			Section: {id: String, items: Array[Forum]},
 *			Parent: {id: String, items: Array[Forum]}
 *		},
 *		Open: {
 *			Section: {id: String, items: Array[Forum]},
 *			Parent: {id: String, items: Array[Forum]}
 *		},
 *		Other: ...(same as above)
 *	}
 *
 * @param  {Object} section Object of forums in this section
 * @param  {Object} parent  Object of forums in the parent if there are any
 * @return {Object}        The binned forums
 */
function binDiscussions (section, parent) {
	var openBin = RegExp.prototype.test.bind(/open/i);
	var forCreditBin = RegExp.prototype.test.bind(/in\-class/i);
	var bins = {};


	function getBin(item) {
		var title = ((item && item.title) || '');
		return	openBin(title) ?		'Open' :
				forCreditBin(title) ?	'ForCredit' :
										'Other';
	}


	function addTo(key, group) {

		var items = (group && group.Items) || [];
		items.forEach(function(item) {
			var bin = getBin(item);
			if (!bins[bin]) {
				bins[bin] = {};
			}

			bin = bins[bin];
			if (!bin[key]) {
				bin[key] = {id: group.NTIID, forums:[]};
			}

			if (bin[key].id !== group.NTIID) {
				console.error('Bad ID match');
			}

			bin[key].forums.push(item);
		});
	}

	addTo('Section', section);
	addTo('Parent', parent);

	return bins;
}
