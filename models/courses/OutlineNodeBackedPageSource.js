'use strict';

var base = require('../mixins/Base');

var defineProperties = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

function OutlineNodeBackedPageSource(node, root) {
	defineProperties(this, {
		_service: withValue(node._service),
		_parent: withValue(node),
		_root: withValue(root),
	});

	this.current = node;

	try {
		this.pagesInRange = flatten(root).filter(suppressed);
	}
	catch(e) {
		console.error(e.stack || e.message || e);
		throw e;
	}
}


Object.assign(OutlineNodeBackedPageSource.prototype, base, {

	getPagesAround: function(pageId) {
		var nodes = this.pagesInRange;
		var index = nodes.reduce(function(found, node, index) {

			if (typeof found !== 'number' && node.getID() === pageId) {
				found = index;
			}

			return found;
		}, null);


		var next = nodes[index + 1];
		var prev = nodes[index - 1];

		return {
			total: nodes.length,
			index: index,
			next: buildRef(next),
			prev: buildRef(prev)
		};
	}

});


module.exports = OutlineNodeBackedPageSource;


function buildRef(node) {
	return node && {
		ntiid: node.getID(),
		title: node.title,
		ref: node.ref
	};
}


function suppressed(node) {
	return node && node.href;
}

function flatten(node) {
	var fn = flatten.fnLoop ||
		(flatten.fnLoop = function(a, n) {
			return a.concat(flatten(n)); });

	return [node].concat(node.contents.reduce(fn, []));
}
