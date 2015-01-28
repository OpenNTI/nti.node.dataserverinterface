'use strict';

var Base = require('../mixins/Base');
//var SharedWithList = require('../mixins/SharedWithList');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var parseObject = require('../../utils/parse-object');

function Post(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);

	//body
	//title
}

Object.assign(Post.prototype, Base, /*SharedWithList,*/ {
	setProperties(newProps) {
		var link = this.getLink('edit');
		if (!link) {
			throw new Error('Post is not editable. (No edit link).');
		}
		var props = {};
		// only allow specific properties to be updated.
		['body', 'title', 'tags'].forEach(propName => {
			if (newProps[propName]) {
				props[propName] = newProps[propName];
			}
		});
		return this._service.put(link, props)
			.then(result => {
				// assimilate the resultant instance's properties. the current instance could be
				// referenced by another object (this could be a topic headline post referenced
				// by its parent topic, for example) so we want the current instance to reflect
				// the changes.
				return Object.assign(this, parseObject(this._parent, result));
			});
	}
});

module.exports = Post;
