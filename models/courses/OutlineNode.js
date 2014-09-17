'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var path = require('path');
var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


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


	__getHref: function() {
		var courseId = (this.__getCourse() || {getID:function(){}}).getID();

		if (!this.ContentNTIID) {
			return undefined;
		}

		return path.join(	'course', encodeURIComponent(courseId),
							'o', encodeURIComponent(this.ContentNTIID));
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

});



function parse(service, parent, data) {
	if (Array.isArray(data)) {
		return data.map(parse.bind(this, service, parent));
	}
	return new OutlineNode(service, parent, data);
}

OutlineNode.parse = parse.bind(OutlineNode);

module.exports = OutlineNode;
