'use strict';

/* jshint -W098 */ //Delete this comment-line once Promise is referenced.

var define = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');
var getLink = require('../utils/getlink');

function Enrollment(service) {
	define(this, {
		_service: withValue(service)
	});
}

Object.assign(Enrollment.prototype, {

	_enrolledCoursesWorkspaceItem: function() {
		var workspace = this._coursesWorkspace();
		var result = null;
		workspace.Items.every(function(item) {
			if(item.Title === 'EnrolledCourses') {
				result = item;
			}
			return !result;
		});
		return result;
	},

	_coursesWorkspace: function() {
		return this._service.getWorkspace('Courses');
	},

	_openEnrollLink: function() {
		return this._enrolledCoursesWorkspaceItem().href;
	},

	_getDropLink: function(course_id) {
		return this._enrollment().then(function(enrollment) {
			for( var i = 0; i < enrollment.Items.length; i++ ) {
				if (enrollment.Items[i].CourseInstance.NTIID === course_id) {
					return enrollment.Items[i].href;
				}
			}
			return null;
		});
	},

	_getGiftRedeemLink: function(purchasable) {
		return getLink((purchasable||{}).Links, 'redeem_gift');
	},

	_enrollment: function() {
		return this._service.get(this._enrolledCoursesWorkspaceItem().href);
	},

	isEnrolled: function(course_id) {
		return this._enrollment()
		.then(function(result) {
			return result.Items.some(function(item) {
				return item.CourseInstance.NTIID === course_id;
			});
		});
	},

	enrollOpen: function(catalogEntryId) {
		var link = this._openEnrollLink();
		return this._service.post(link,{
			NTIID: catalogEntryId
		});
	},

	dropCourse: function(course_id) {
		return this._getDropLink(course_id).then(function(link) {
			return this._service.delete(link);
		}.bind(this));
	},

	redeemGift: function(purchasable, accessKey) {
		var link = this._getGiftRedeemLink(purchasable);
		if (!link) {
			return Promise.reject('Couldn\'t find the gift redemption link for the provided purchasable');
		}
		return this._service.post(link, {
			code: accessKey
		});

	}
});

module.exports = Enrollment;
