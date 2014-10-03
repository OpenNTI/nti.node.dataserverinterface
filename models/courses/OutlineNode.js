'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var path = require('path');
var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var encodeForURI = require('dataserverinterface/utils/ntiids').encodeForURI;

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


	getContent: function() {
		var src = this.getLink('overview-content') || getSrc(this);
		return src ? this._service.get(src) : getContentFallback(this);
	}
});



function parse(service, parent, data) {
	if (Array.isArray(data)) {
		return data.map(parse.bind(this, service, parent));
	}
	return new OutlineNode(service, parent, data);
}

OutlineNode.parse = parse.bind(OutlineNode);

module.exports = OutlineNode;



/*******************************************************************************
 * FALLBACK TEMPORARY STUFF BELOW THIS POINT
 */

function getSrc(node) {
	var course = node.__getCourse();
	var bundle = course && course.ContentPackageBundle;
	var firstPackage = ((bundle && bundle.ContentPackages) || [])[0];
	var root = firstPackage && firstPackage.root;

	if (node.src) {
		if (node.src.split('/').length === 1) {
			return path.join(root || '', node.src);
		}
		return node.src;
	}

	return undefined;
}


function getContentFallback(node) {
	var course = node.__getCourse();
	var bundle = course && course.ContentPackageBundle;
	var pkg = ((bundle && bundle.ContentPackages) || [])[0];

	var p = pkg ? pkg.getTableOfContents() : Promise.reject('No Content Package');

	return p.then(function(toc) {
		console.debug(toc);

		return Promise.reject('TODO: No overview JSON file');
	});
}
