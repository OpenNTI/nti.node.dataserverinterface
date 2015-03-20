import BasicEvent from './Base';
import {WATCH_VIDEO} from './MimeTypes';

export default class WatchVideoEvent extends BasicEvent {

	constructor (resourceId, context, videoStartTime, maxDuration, hasTranscript) {
		super(WATCH_VIDEO, null, (context||[])[0] || null);
		Object.assign(this, {
			MaxDuration: maxDuration,
			resource_id: resourceId,
			context_path: context,
			video_start_time: videoStartTime,
			with_transcript: !!hasTranscript
		});
	}

	finish (videoEndTime, eventEndTime = Date.now()) {
		super.finish(eventEndTime);
		this.video_end_time = videoEndTime;
	}
}
