import getLink from '../utils/getlink';

import Library from './Library';

import {Service} from '../CommonSymbols';

export default class Enrollment {
	constructor (service) {
		this[Service] = service;
	}


	getLibrary () {
		return Library.get(this[Service], 'Main');
	}


	isEnrolled (courseId) {
		return this.getLibrary().then(library => !!library.getCourse(courseId));
	}


	enrollOpen (catalogEntryId) {
		let service = this[Service];
		return service.post(service.getCoursesEnrolledURL(),{
			NTIID: catalogEntryId
		});
	}


	dropCourse (courseId) {

		return this.getLibrary()
			.then(library =>
				library.getCourse(courseId) || Promise.reject('Not Enrolled'))

			.then(course => course.drop());
	}


	redeemGift (purchasable, accessKey) {
		if (purchasable.getLink) {
			console.error('Use model@getLink');
		} else {
			console.error('purchasable needs to be a model');
		}

		var link = getLink(purchasable, 'redeem_gift');
		if (!link) {
			return Promise.reject('Couldn\'t find the gift redemption link for the provided purchasable');
		}

		return this[Service].post(link, { code: accessKey });
	}
}
