import Base from '../Base';
import {Service} from '../../CommonSymbols';

import names from '../mixins/CourseAndAssignmentNameResolving';

export default class AssignmentFeedback extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, names);
	}


	delete () {
		var link = this.getLink('edit');
		if (!link) {
			return Promise.reject(new Error('No Edit Link'));
		}

		return this[Service].delete(link);
	}


	editBody (body) {
		var link = this.getLink('edit');
		if (!link) {
			return Promise.reject(new Error('No Edit Link'));
		}

		this.body = body;

		return this[Service].put(link, this.getData());
	}

}
