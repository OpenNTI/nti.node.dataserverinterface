import BasicEvent from './Base';
import {TOPIC_VIEWED} from './MimeTypes';

export default class TopicViewedEvent extends BasicEvent {
	constructor (topicId, courseId, duration) {
		super(courseId, duration);
		Object.assign(this, {
			MimeType: TOPIC_VIEWED,
			type: 'discussion-viewed',
			topic_id: topicId
		});
	}
}
