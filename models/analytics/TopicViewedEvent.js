import BasicEvent from './Base';
import * as Types from './MimeTypes';

export default class TopicViewedEvent extends BasicEvent {
	constructor (topicId, courseId, duration) {
		super(courseId, duration);
		Object.assign(this, {
			MimeType: Types.TOPIC_VIEWED,
			type: 'discussion-viewed',
			topic_id: topicId
		});
	}
}
