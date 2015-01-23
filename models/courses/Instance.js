'use strict';

var Url = require('url');
var getLink = require('../../utils/getlink');

var base = require('../mixins/Base');

var emptyFunction = require('../../utils/empty-function');
var waitFor = require('../../utils/waitfor');
var define = require('../../utils/object-define-properties');

var withValue = require('../../utils/object-attribute-withvalue');

var parseKey = require('../../utils/parse-object-at-key');
var parser = parseKey.parser;


var AssessmentCollection = require('../assessment/Collection');

var emptyCatalogEntry = {getAuthorLine: emptyFunction};

const OutlineCache = Symbol('OutlineCache');

function Instance(service, parent, data) {
	define(this, {
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);

	var parse = parseKey.bind(this, this);
	var bundle = parse('ContentPackageBundle');
	bundle.on('changed', this.onChange.bind(this));

	parse('ParentDiscussions');
	parse('Discussions');
	parse('Outline');

	this.__pending = [resolveCatalogEntry(this), ...bundle.__pending];
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

			if (section) {
				section.NTIID = sectionId;
			}

			if (parent) {
				parent.NTIID = parentId;
			}

			return binDiscussions(section, parent);
		});
	},


	getOutline: function() {
		var link = getLink(this.Outline || {}, 'contents');
		if (!link) {
			return Promise.reject('No Outline or content link');
		}

		if (!this[OutlineCache]) {
			this[OutlineCache] = waitFor(this.__pending)
				.then(()=>
					this.CatalogEntry.Preview ?
						Promise.reject('Preview') :
						Promise.all([
							this._service.get(link),
							this.getAssignments().catch(emptyFunction) ])
						.then(contents=> {
							var [OutlineContents, Assignments] = contents;

							var o = this.Outline;

							define(o, {_assignments: withValue(Assignments)});

							o.contents = parser(o, OutlineContents);
							return o;
						})
				);
		}
		return this[OutlineCache];
	},


	getOutlineNode: function (id) {
		return this.getOutline()
			.then(function(outline) {
				return outline.__getNode(id) ||
						Promise.reject('Outline Node not found');
			});
	},


	getVideoIndex: function() {
		return Promise.all(
			this.ContentPackageBundle.map(pkg=>pkg.getVideoIndex()))
				.then(indices =>
					indices.reduce((a,b) =>a.combine(b)));
	},


	resolveContentURL: function(url) {
		var bundle = this.ContentPackageBundle;
		var pkg = ((bundle && bundle.ContentPackages) || [])[0];//probably should search all packages...

		var root = Url.parse(pkg.root);

		return Promise.resolve(root.resolve(url));
	}
});


module.exports = Instance;

//Private methods

function resolveCatalogEntry(me) {

	function parseCCE(cce) {
		cce = parser(service, cce);
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
	var bins = {};

	function addTo(key, group) {

		var items = (group && group.Items) || [];
		for(let item of items) {
			let bin = item.getBin();
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
		}
	}

	addTo('Section', section);
	addTo('Parent', parent);

	return bins;
}
