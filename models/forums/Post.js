'use strict';

var Base = require('../mixins/Base');
//var SharedWithList = require('../mixins/SharedWithList');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

function Post(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);

	//body
	//title
}

Object.assign(Post.prototype, Base, /*SharedWithList,*/ {});

module.exports = Post;
