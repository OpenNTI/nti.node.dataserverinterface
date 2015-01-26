'use strict';

var base = require('../mixins/Base');
var Types = require('./MimeTypes');

function TopicViewedEvent(topicId, courseId, duration) {
	Object.assign(this, {
		MimeType: Types.TOPIC_VIEWED,
		type: 'discussion-viewed',
		topic_id: topicId,
		course: courseId,
		time_length: duration,
		timestamp: Date.now() / 1000 //the server is expecting seconds
	});
}

Object.assign(TopicViewedEvent.prototype, base, {

	setContextPath: function(path) {
		this.context_path = path;
	},

	getDuration: function () {
		return this.time_length;
	}
});

module.exports = TopicViewedEvent;
