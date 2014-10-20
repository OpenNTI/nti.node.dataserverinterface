'use strict';

var et = require('elementtree');
var merge = require('merge');
var base = require('./mixins/Base');

var PageSource = require('./TableOfContentsBackedPageSource');

var forwardFunctions = require('../utils/function-forwarding');
var defineProperties = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');

function TableOfContents(service, data, parent) {
	defineProperties(this, {
		_service: withValue(service),
		_parent: withValue(parent),
		_root: withValue(parseXML(data))
	});

	cleanNodes(this._root, this);
	//deepFreeze(this._root)
}


merge(TableOfContents.prototype, base,
	forwardFunctions(['find'], '_root'), {

	getVideoIndexRef: function() {
		var ref = this._root.find('.//reference[@type="application/vnd.nextthought.videoindex"]');
		return ref && ref.get('href');
	},


	getNode: function(id) {
		var n = this._root,
			r = n._root;
		return r.get('ntiid') === id ? r : n.find('.//*[@ntiid="' + id + '"]');
	},


	getSortPosition: function(id) {
		var node = this.getNode(id);
		return (node && node._id) || -1;
	},


	getPageSource: function(rootId) {
		return new PageSource(this, rootId);
	}

});


function parse(service, data, parent) {
	return new TableOfContents(service, data, parent);
}

TableOfContents.parse = parse.bind(TableOfContents);

module.exports = TableOfContents;




/**
 * Super Secret private details...
 */

function parseXML(string) {
	return et.parse(string);
}


function cleanNodes(x, o) {
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

	var p = o.up('__cleanToCNodes');

	if (p) {
		p.__cleanToCNodes(x, remove);
	}

	return x;
}
