import BasicEvent from './Base';
import {RESOURCE_VIEWED} from './MimeTypes';

export default class ResourceEvent extends BasicEvent {
	constructor (resourceId, courseId, duration) {
		super(courseId, duration);
		Object.assign(this, {
			MimeType: RESOURCE_VIEWED,
			type: 'resource-viewed',
			resource_id: resourceId
		});
	}
}
