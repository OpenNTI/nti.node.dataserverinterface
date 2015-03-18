/**
 * This is an OU API, perhaps we should bury this deeper in to the package?
 *
 * Like:
 *	/interface/thirdparties/ou/FiveMinute.js
 *
 */

import ServiceModel from '../stores/Service';

import {Context, Server} from '../CommonSymbols';

export default class FiveMinuteInterface {
	static fromService (service) {
		let server = service[Server];
		let context = service[Context];
		return new this(server, context);
	}


	constructor (server, context) {
		Object.assign(this, {
			get: ServiceModel.prototype.get,
			post: ServiceModel.prototype.post,
			[Server]: server,
			[Context]: context
		});
	}

	getServer () { return this[Server]; }

	_getAppUser () {
		//FIXME: This doesn't leverage our instance cache.
		//This will create a new Service Doc instance (as well
		// as a new App User model instance)
		return this[Server].getServiceDocument().then(doc=>doc.getAppUser());
	}

	getAdmissionStatus () {
		return this._getAppUser()
			.then(user=>(user||{}).fmaep_admission_state);
	}

	_getUserLink (rel) {
		return this._getAppUser().then(user=>user.getLink(rel));
	}

	preflight (data) {
		// get the preflight link.
		let p = this._getUserLink('fmaep.admission.preflight');

		// post the data to the link
		let r = p.then(link => this.post(link, data));

		return r;
	}

	requestAdmission (data) {
		console.debug('five minute service requestAdmission');
		let getLink = this._getUserLink('fmaep.admission');
		let r = getLink.then(link => this.post(link, data));
		return r;
	}

	requestConcurrentEnrollment (data) {
		return this._getUserLink('concurrent.enrollment.notify')
			.then(link => this.post(link, data));
	}

	getPayAndEnroll (link, ntiCrn, ntiTerm, returnUrl) {
		console.debug(link);
		return this.post(link, {
			crn: ntiCrn,
			term: ntiTerm,
			return_url: returnUrl
		});
	}
}
