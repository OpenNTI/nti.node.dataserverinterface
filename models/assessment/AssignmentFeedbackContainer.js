import Base from '../Base';
import {
	Service,
	Parser as parse
} from '../../CommonSymbols';


export default class AssignmentFeedbackContainer extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		this.Items = data.Items.map(p=>this[parse](p));
	}

	addPost (body) {
		var link = this.getLink('edit');
		if (!link) {
			return Promise.reject(new Error('No Edit Link'));
		}

		var payload = {
			MimeType: 'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback',
			Class: 'UsersCourseAssignmentHistoryItemFeedback',
			body: Array.isArray(body) ? body : [body]
		};

		return this[Service].post(link, payload);
	}

}
