import BasicEvent from './Base';
import * as Types from './MimeTypes';

export default class ResourceEvent extends BasicEvent {
	constructor (resourceId, courseId, duration) {
		super(courseId, duration);
		Object.assign(this, {
			MimeType: Types.RESOURCE_VIEWED,
			type: 'resource-viewed',
			resource_id: resourceId
		});
	}
}
