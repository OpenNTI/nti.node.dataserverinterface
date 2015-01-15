'use strict';

var Base = require('../mixins/Base');
var GetContents = require('../mixins/GetContents');
//var SharedWithList = require('../mixins/SharedWithList');

var define = require('../../utils/object-define-properties');
var parseKey = require('../../utils/parse-object-at-key');
var withValue = require('../../utils/object-attribute-withvalue');

function Topic(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);

	// PostCount
	// title
	// PublicationState
	// NewestDescendant
	// NewestDescendantCreatedTime

	parseKey(this, 'NewestDescendant');
	parseKey(this, 'headline');
}

Object.assign(Topic.prototype, Base, GetContents, /*SharedWithList,*/ {
	addComment: function(comment, inReplyTo) {
		var link = this.getLink('add');
		if (!link) {
			return Promise.reject('Cannot post comment. Item has no \'add\' link.');
		}

		var payload = {
			MimeType: 'application/vnd.nextthought.forums.post',
			tags: [],
			body: Array.isArray(comment) ? comment : [comment]
		};

		if (inReplyTo) {
			inReplyTo = typeof inReplyTo === 'object' ? inReplyTo.NTIID : inReplyTo;
			payload.inReplyTo = inReplyTo;
		}

		return this._service.post(link, payload);
	}
});


function parse(service, parent, data) {
	return new Topic(service, parent, data);
}

Topic.parse = parse;

module.exports = Topic;
