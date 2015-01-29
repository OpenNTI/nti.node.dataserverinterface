import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

export default class SavePointItem extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		this.Submission = data.Submission && this[parse](data.Submission);
	}


	getQuestions () {
		return this.Submission ? this.Submission.getQuestions() : [];
	}

	isSubmitted () { return false; }

}
