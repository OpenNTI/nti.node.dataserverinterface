'use strict';

var Base = require('../mixins/Base');
var GetContents = require('../mixins/GetContents');
//var SharedWithList = require('../mixins/SharedWithList');

var Board = require('./Board');

var define = require('../../utils/object-define-properties');
var parseKey = require('../../utils/parse-object-at-key');
var withValue = require('../../utils/object-attribute-withvalue');
var parser = require('../Parser');

function Forum(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);

	// Creator: "username"
	// ID: "Forum" -- Local id (within the container)
	// NewestDescendant
	// NewestDescendantCreatedTime
	// TopicCount: 2
	// description: ""
	// title: "Forum"

	parseKey(this, 'NewestDescendant');
}

Object.assign(Forum.prototype, Base, GetContents, /*SharedWithList,*/ {
	getBoard: function() {
		// if this._parent is an instance of Board and its ID matches this.containerId, return this._parent;
		if (this._parent instanceof Board && this._parent.getID() === this.containerId) {
			return Promise.resolve(this._parent);
		}
		else { // otherwise fetch the container by id.
			return this._service.getObject(this.containerId)
				.then(function(result) {
					var p = parser(this._service, null, result);
					return p;
				});
		}
	}
});


function parse(service, parent, data) {
	return new Forum(service, parent, data);
}

Forum.parse = parse;

module.exports = Forum;
