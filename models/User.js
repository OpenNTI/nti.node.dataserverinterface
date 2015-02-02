import Base from './Base';

export default class User extends Base {

	constructor (service, data) {
		super(service, null, data);
	}

	get DisplayName () {
		return this.alias || this.realname || this.Username;
	}
}
