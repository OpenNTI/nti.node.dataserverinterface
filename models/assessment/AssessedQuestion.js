import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

import assessed from '../mixins/AssessedAssessmentPart';

export default class AssessedQuestion extends Base {
	constructor(service, parent, data) {
		super(service, parent, data, assessed);

		this.parts = data.parts.map(part =>this[parse](part));
	}


	getID () {
		return this.questionId || this.NTIID;
	}

	
	isSubmitted () {
		return true;
	}


	isCorrect () {
		let p = this.parts || [],
			i = p.length - 1, v;

		for (i; i >= 0; i--) {
			v = p[i].isCorrect();
			if (!v) {
				return v;
			}
		}

		return true;
	}
}
