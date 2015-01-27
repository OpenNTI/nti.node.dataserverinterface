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
	setBody(newValue) {
		var link = this.getLink('edit');
		if (!link) {
			throw new Error('Post is not editable. (No edit link).');
		}
		return this._service.put(link, {
			body: newValue
		})
		.then(result => parseObject(this._parent, result));
	}
});

module.exports = Post;
