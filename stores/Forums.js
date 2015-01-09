'use strict';

var define = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');

var Topic = require('../models/forums/Topic');
var Forum = require('../models/forums/Forum');

var parser = require('../models/Parser');
var NTIID = require('../utils/ntiids');

function Forums(service) {
	define(this, {
		_service: withValue(service)
	});
}

Object.assign(Forums.prototype, {

	getObject: function(ntiid) {
		ntiid = NTIID.decodeFromURI(ntiid);
		return this._service.getObject(ntiid)
			.then(
				function(result) {
					return parser(this._service, null, result);
				}.bind(this)
			);
	},

	getBoard: function(courseId, boardId) {
		var objId = courseId.concat(['/Discussions',boardId].join('/'));
		return this._service.getObject(objId)
			.then(
				function(result) {
					var board = Forum.parse(this._service, null, result);
					return board;
				}.bind(this)
			);
	},

	getBoardContents: function(courseId, boardId) {
		return this.getBoard(courseId, boardId)
			.then(function(board) {
				return board.getContents();
			});
	},

	getForumContents: function(courseId, boardId, forumId) {
		return this.getForum(courseId, boardId, forumId)
			.then(function(forum) {
				return forum.getContents();
			});
	},

	getTopic: function(courseId, forumId, topicId) {
		var objId = courseId.concat(['/Discussions',forumId, topicId].join('/'));
		return this._service.getObject(objId)
			.then(
				function(result) {
					var topic = Topic.parse(this._service, null, result);
					return topic;
				}.bind(this),
				function(reason) {
					console.error(reason);
				}
			);
	},

	getTopicContents: function(courseId, forumId, topicId) {
		return this.getTopic(courseId, forumId, topicId)
			.then(function(topic) {
				return topic.getContents();
			});
	}
});

module.exports = Forums;
