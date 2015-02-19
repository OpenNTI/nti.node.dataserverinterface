import Enrollment from './Enrollment';

export default class InstanceAdministrativeRole extends Enrollment {
	constructor (service, data) {
		super(service, data);

		this.isAdministrative = true;

		//RoleName
	}
}
