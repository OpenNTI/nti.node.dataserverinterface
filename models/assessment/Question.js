import Base from '../Base';
import {
	Service,
	Parser as parse
} from '../../CommonSymbols';

import HasContent from '../mixins/HasContent';

export default class Question extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, HasContent);

		this.parts = data.parts.map(p=>this[parse](p));

		this[parse]('wordbank');
	}


	getVideos () {
		//Eeewww...
		var all = this.getModel('assessment.part').prototype.getVideos.call(this);

		for(let p of this.parts) {
			all.push.apply(all, p.getVideos());
		}
		return all;
	}



	getSubmission () {
		let Model = this.getModel('assessment.questionsubmission');
		return Model.build(this[Service], {
			ContainerId: this.containerId,
			NTIID: this.getID(),
			questionId: this.getID(),
			parts: this.parts.map(()=>null)
		});
	}



	isAnswered (questionSubmission) {
		var expect = this.parts.length;
		var {parts} = questionSubmission;

		return this.parts.filter((p,i)=>p.isAnswered(parts[i])).length === expect;
	}

}
