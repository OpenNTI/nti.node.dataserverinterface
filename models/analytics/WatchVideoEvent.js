'use strict';


var base = require('../mixins/Base');

function WatchVideoEvent(resourceId, rootContextId, context, duration, startTime, endTime, maxDuration, hasTranscript) {
	Object.assign(this, {
		MimeType: 'application/vnd.nextthought.analytics.watchvideoevent',
		MaxDuration: maxDuration,
		type: 'video-watch',
		resource_id: resourceId,
		RootContextID: rootContextId,
		context_path: context,
		time_length: duration,
		video_start_time: startTime,//the server is expecting seconds
		video_end_time: endTime, //the server is expecting seconds
		with_transcript: !!hasTranscript,
		timestamp: Date.now() / 1000 //the server is expecting seconds
	});
}

Object.assign(WatchVideoEvent.prototype, base, {

	setContextPath: function(path) {
		this.context_path = path;
	}
});

module.exports = WatchVideoEvent;
