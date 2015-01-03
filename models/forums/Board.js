'use strict';

var Base = require('../mixins/Base');
var GetContents = require('../mixins/GetContents');
//var SharedWithList = require('../mixins/SharedWithList');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function Board(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);

	// ForumCount: 1
	// description: ""
	// title: "Discussions"
}

Object.assign(Board.prototype, Base, GetContents, /*SharedWithList,*/ {



});


function parse(service, parent, data) {
	return new Board(service, parent, data);
}

Board.parse = parse;

module.exports = Board;
