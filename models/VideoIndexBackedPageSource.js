'use strict';

var path = require('path');
var assign = require('../utils/assign');
var base = require('./mixins/Base');

var NTIID = require('../utils/ntiids');
var defineProperties = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');

function VideoIndexBackedPageSource(index) {
	defineProperties(this, {
		_service: withValue(index._service),
		_parent: withValue(index),
	});
}


assign(VideoIndexBackedPageSource.prototype, base, {

	getPagesAround: function(pageId) {
		var nodes = this._parent;
		var index = nodes.reduce(function(found, node, index) {

			if (typeof found !== 'number' && node.getID() === pageId) {
				found = index;
			}

			return found;
		}, null);


		var next = nodes.getAt(index + 1);
		var prev = nodes.getAt(index - 1);

		return {
			total: nodes.length,
			index: index,
			next: buildRef(next),
			prev: buildRef(prev)
		};
	}

});


module.exports = VideoIndexBackedPageSource;


function buildRef(node) {
	var id = node && node.getID();
	return id && {
		ntiid: id,
		title: node.title,
		ref: path.join('v', NTIID.encodeForURI(id))
	};
}
