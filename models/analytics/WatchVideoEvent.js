import BasicEvent from './Base';
import {WATCH_VIDEO} from './MimeTypes';

export default class WatchVideoEvent extends BasicEvent {

	constructor (resourceId, rootContextId, context, duration, startTime, endTime, maxDuration, hasTranscript) {
		super(null, duration);
		Object.assign(this, {
			MimeType: WATCH_VIDEO,
			MaxDuration: maxDuration,
			type: 'video-watch',
			resource_id: resourceId,
			RootContextID: rootContextId,
			context_path: context,
			video_start_time: startTime,//the server is expecting seconds
			video_end_time: endTime, //the server is expecting seconds
			with_transcript: !!hasTranscript
		});
	}
}
