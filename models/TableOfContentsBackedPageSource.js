'use strict';

var merge = require('merge');
var base = require('./mixins/Base');

var defineProperties = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');

function TableOfContentsBackedPageSource(ToC, root) {
	defineProperties(this, {
		_service: withValue(ToC._service),
		_parent: withValue(ToC),
		_root: withValue(ToC.getNode(root))
	});
	try {
		this.pagesInRange = flatten(this._root).filter(suppressed);
	}
	catch(e) {
		console.error(e.stack || e.message || e);
		throw e;
	}
}


merge(TableOfContentsBackedPageSource.prototype, base, {

	getPagesAround: function(pageId) {
		var query = './/*[@ntiid="' + pageId + '"]';
		var root = this._root;
		var node = root.find(query) || (root.get('ntiid') === pageId && root);
		var nodes = this.pagesInRange;

		var index = nodes.indexOf(node);

		var next = nodes[index + 1];
		var prev = nodes[index - 1];

		return {
			next: buildRef(next),
			prev: buildRef(prev)
		};
	}

});


module.exports = TableOfContentsBackedPageSource;


function buildRef(node) {
	return node && {
		ntiid: node.get('ntiid'),
		title: node.get('label')
	};
}


function suppressed(node) {
	var isAnchor = suppressed.is || (suppressed.id = /#/);
	return node && !isAnchor.test(node.get('href'));
}

function flatten(node) {
	var fn = flatten.fnLoop ||
		(flatten.fnLoop = function(a, n) {
			return a.concat(flatten(n)); });

	return [node].concat(node._children.reduce(fn, []));
}
