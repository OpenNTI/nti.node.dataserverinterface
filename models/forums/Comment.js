'use strict';

var Base = require('./Post');
var parseObject = require('../../utils/parse-object');

function Comment(service, parent, data) {
	Base.call(this, service, parent, data);
}

Comment.prototype = Object.create(Base.prototype);
Object.assign(Comment.prototype, {
	constructor: Comment,

	getReplies: function() {
		var link = this.getLink('replies');
		if (!link) {
			return Promise.resolve([]);
		}

		var params = {
			sortOn: 'CreatedTime',
			sortOrder: 'ascending',
			filter: 'TopLevel'
		};

		return this._service.get(link, params)
			.then(function(result) {
				return parseObject(this, result);
			}.bind(this));
	}
});

function parse(service, parent, data) {
	return new Comment(service, parent, data);
}


Comment.parse = parse;
module.exports = Comment;
