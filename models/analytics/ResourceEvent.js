'use strict';

var base = require('../mixins/Base');

function ResourceEvent(resourceId, courseId, duration) {
	Object.assign(this, {
		MimeType: 'application/vnd.nextthought.analytics.resourceevent',
		type: 'resource-viewed',
		resource_id: resourceId,
		course: courseId,
		time_length: duration,
		timestamp: Date.now() / 1000 //the server is expecting seconds
	});
}

Object.assign(ResourceEvent.prototype, base, {

	setContextPath: function(path) {
		this.context_path = path;
	},

	getDuration: function () {
		return this.time_length;
	}
});

module.exports = ResourceEvent;
