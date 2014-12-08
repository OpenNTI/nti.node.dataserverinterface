'use strict';

var define = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');
var getLink = require('../utils/getlink');

var Library = require('./Library');

function Enrollment(service) {
	define(this, {
		_service: withValue(service)
	});
}

Object.assign(Enrollment.prototype, {

	__getLibrary: function () {
		return Library.get(this._service, 'Main');
	},


	isEnrolled: function(courseId) {
		return this.__getLibrary().then(function(library) {
			return !!library.getCourse(courseId);
		});
	},


	enrollOpen: function(catalogEntryId) {
		return this._service.post(this._service.getCoursesEnrolledURL(),{
			NTIID: catalogEntryId
		});
	},


	dropCourse: function(courseId) {

		return this.__getLibrary()
			.then(function(library) {
				return library.getCourse(courseId) || Promise.reject('Not Enrolled');
			})

			.then(function(course) { return course.drop(); });
	},


	redeemGift: function(purchasable, accessKey) {
		var link = getLink(purchasable, 'redeem_gift');
		if (!link) {
			return Promise.reject('Couldn\'t find the gift redemption link for the provided purchasable');
		}
		return this._service.post(link, {
			code: accessKey
		});

	}
});

module.exports = Enrollment;
