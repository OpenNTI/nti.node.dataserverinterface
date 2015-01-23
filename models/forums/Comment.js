'use strict';

var Base = require('./Post');
var parseObject = require('../../utils/parse-object');
var QueryString = require('query-string');

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
			sortOrder: 'ascending'
		};

		link = link.concat('?',QueryString.stringify(params));

		return this._service.get(link)
			.then(function(result) {
				return parseObject(this, result.Items);
			}.bind(this));
	}
});

module.exports = Comment;
