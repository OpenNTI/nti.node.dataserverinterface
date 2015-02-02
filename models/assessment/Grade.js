import Base from '../Base';
import names from '../mixins/CourseAndAssignmentNameResolving';

export default class Grade extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, names);
	}

	getValue () {
		return this.value;
	}

	isExcused () {
		return !!this.IsExcused;
	}
}
