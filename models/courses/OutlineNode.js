'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var path = require('path');
var merge = require('merge');

var base = require('../mixins/Base');
var makeFallbackOverview = require('./_fallbacks.OverviewFromToC');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var encodeForURI = require('../../utils/ntiids').encodeForURI;

function OutlineNode(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent),
		href: {
			enumerable: true,
			configurable: false,
			get: this.__getHref.bind(this)
		}
	});
	merge(this, data);

	var c = this.contents;
	this.contents = (c && c.map(parse.bind(this, service, this))) || [];
}

merge(OutlineNode.prototype, base, {

	getID: function() {
		return this.ContentNTIID;
	},


	__getNode: function (id) {
		if (this.getID() === id) {
			return this;
		}

		return this.contents.reduce(function (item, potential) {
			return item || potential.__getNode(id); }, null);
	},


	__getHref: function() {
		var courseId = (this.__getCourse() || {getID:function(){}}).getID();
		var id = this.getID();

		if (!id) {
			return undefined;
		}

		return path.join(	'course', encodeForURI(courseId),
							'o', encodeForURI(id)) + '/';//end in a separator
	},


	__getCourse: function() {
		return this.__getRoot()._parent;
	},


	__getRoot: function() {

		function up(o) {
			var p = o && o._parent;
			if (!p || !(p instanceof OutlineNode)) {
				return o;
			}

			return up(p);
		}

		return up(this);
	},


	__getMaxDepthFromHere: function() {
		return this.contents.map(function(item) {
			return item.__getMaxDepthFromHere() + 1;
		}).reduce(function(agg, item) {
			return Math.max(agg, item);
		}, 0);
	},


	isOpen: function() {},


	isLeaf: function() {},


	isHeading: function() {},


	isSection: function() {},


	getMaxDepth: function() {
		return this.__getRoot()
			.__getMaxDepthFromHere();
	},


	getDepth: function() {

		var level = 0;//lvl 0 = root
		var p = this._parent;
		while (p) {
			level++;
			p = p._parent;
			if (p && !(p instanceof OutlineNode)) {
				p = null;
			}
		}

		return level;
	},


	getAssignments: function () {
		var collection = this.__getRoot()._assignments;
		if (collection) {
			return collection.getAssignments(this.getID());
		}
		return [];
	},


	getAssignment: function (assignmentId) {
		var collection = this.__getRoot()._assignments;
		return collection && collection.getAssignment(this.getID(), assignmentId);
	},


	getContent: function() {
		var src = this.getLink('overview-content') || getSrc(this);
		return src ? this._service.get(src).then(collateVideo) : getContentFallback(this);
	}
});



function parse(service, parent, data) {
	if (Array.isArray(data)) {
		return data.map(parse.bind(OutlineNode, service, parent));
	}
	return new OutlineNode(service, parent, data);
}

OutlineNode.parse = parse;

module.exports = OutlineNode;


function collateVideo(json) {
	var re = /ntivideo$/;
	function collagte(list, current, index, items) {
		var last = list[list.length - 1];
		if (re.test(current.MimeType)) {
			//last was a video...
			if (last && re.test(last.MimeType)){
				last = list[list.length - 1] = {
					MimeType: 'application/vnd.nextthought.ntivideoset',
					Items: [last]
				};
			}

			//The previous item is a video set...(or we just created it)
			if (last && /ntivideoset$/.test(last.MimeType)) {
				last.Items.push(current);
				return list;
			}

		} else if (current.Items) {
			current = collateVideo(current);
		}

		list.push(current);
		return list;
	}

	json.Items = json.Items.reduce(collagte, []);

	return json;
}


/*******************************************************************************
 * FALLBACK TEMPORARY STUFF BELOW THIS POINT
 */

function getSrc(node) {
	var course = node.__getCourse();
	var bundle = course && course.ContentPackageBundle;
	var firstPackage = ((bundle && bundle.ContentPackages) || [])[0];
	var root = firstPackage && firstPackage.root;

	if (node.src) {
		console.debug('[FALLBACK] Deriving outline node src path');
		if (node.src.split('/').length === 1) {
			return path.join(root || '', node.src);
		}
		return node.src;
	}

	return undefined;
}


function getContentFallback(outlineNode) {
	console.debug('[FALLBACK] Deriving outline outlineNode src content');
	var course = outlineNode.__getCourse();
	var bundle = course && course.ContentPackageBundle;
	var pkg = ((bundle && bundle.ContentPackages) || [])[0];
	var contentId = outlineNode.getID();

	var p = pkg ? pkg.getTableOfContents() : Promise.reject('No Content Package');

	return p.then(function(toc) {
		var tocNode = toc.getNode(contentId);
		//console.debug(toc, node);

		return makeFallbackOverview(tocNode, outlineNode);
		//return Promise.reject('TODO: No overview JSON file');
	});
}
