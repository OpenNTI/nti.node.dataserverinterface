import Enrollment from './Enrollment';

export default class InstanceAdministrativeRole extends Enrollment {
	constructor (service, parent, data) {
		super(service, parent, data, {isAdministrative: true});

		//RoleName
	}
}
