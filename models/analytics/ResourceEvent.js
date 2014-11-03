'use strict';

var merge = require('merge');

var base = require('../mixins/Base');

function ResourceEvent(resourceId, courseId, duration) {
	merge(this, {
		MimeType: 'application/vnd.nextthought.analytics.resourceevent',
		type: 'resource-viewed',
		resource_id: resourceId,
		course: courseId,
		time_length: duration,
		timestamp: Date.now()
	});
}

merge(ResourceEvent.prototype, base, {

	setContextPath: function(path) {
		this.context_path = path;
	}
});

module.exports = ResourceEvent;