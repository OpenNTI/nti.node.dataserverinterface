import BasicEvent from './Base';
import {WATCH_VIDEO} from './MimeTypes';

export default class WatchVideoEvent extends BasicEvent {

	constructor (resourceId, rootContextId, context, startTime, maxDuration, hasTranscript) {
		super(WATCH_VIDEO, null, rootContextId, startTime);
		Object.assign(this, {
			MaxDuration: maxDuration,
			resource_id: resourceId,
			context_path: context,
			video_start_time: startTime / 1000, // the server is expecting seconds
			with_transcript: !!hasTranscript
		});
	}

	finish (endTime = Date.now()) {
		super.finish(endTime);
		this.video_end_time = endTime / 1000;
	}
}
