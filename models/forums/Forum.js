'use strict';

var Base = require('../mixins/Base');
var GetContents = require('../mixins/GetContents');
//var SharedWithList = require('../mixins/SharedWithList');

var define = require('../../utils/object-define-properties');
var parseKey = require('../../utils/parse-object-at-key');
var withValue = require('../../utils/object-attribute-withvalue');

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

	getBin: function () {
		var openBin = RegExp.prototype.test.bind(/open/i);
		var forCreditBin = RegExp.prototype.test.bind(/in\-class/i);
		var title = this.title || '';

		return	openBin(title) ?		'Open' :
				forCreditBin(title) ?	'ForCredit' :
										'Other';
	},

	getRecentActivity: function(size) {
		
		var params = { 
			batchStart: 0,
			batchSize: size||5,
			sortOrder: 'descending',
			sortOn: 'NewestDescendantCreatedTime'
		};

		return this.getContents(params).then(function(result) { return result.Items; });
	},

	createTopic: function(data) {
		var link = this.getLink('add');
		if (!link) {
			return Promise.reject('Cannot post comment. Item has no \'add\' link.');
		}

		var {title,body} = data;

		var payload = {
			MimeType: 'application/vnd.nextthought.forums.post',
			tags: [],
			title: title,
			body: Array.isArray(body) ? body : [body]
		};

		return this._service.post(link, payload).then(
			result => {
				console.group('Create Topic');
				console.debug(result);
				console.groupEnd();
				// post to @@publish url?
			},
			reason => {
				console.error(reason);
			}
		);
	}

});


function parse(service, parent, data) {
	return new Forum(service, parent, data);
}

Forum.parse = parse;

module.exports = Forum;
