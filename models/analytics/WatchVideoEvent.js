'use strict';

var assign = require('object-assign');

var base = require('../mixins/Base');

function WatchVideoEvent(resourceId, rootContextId, context, duration, startTime, endTime, hasTranscript) {
	assign(this, {
		MimeType: 'application/vnd.nextthought.analytics.watchvideoevent',
		type: 'video-watch',
		resource_id: resourceId,
		RootContextID: rootContextId,
		context_path: context,
		time_length: duration,
		video_start_time: startTime,
		video_end_time: endTime,
		with_transcript: hasTranscript,
		timestamp: Date.now()
	});
}

assign(WatchVideoEvent.prototype, base, {

	setContextPath: function(path) {
		this.context_path = path;
	}
});

module.exports = WatchVideoEvent;
