'use strict';

/* jshint -W098 */ //Delete this comment-line once Promise is referenced.
var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');
var withValue = require('../utils/object-attribute-withvalue');

function Enrollment(service) {
	Object.defineProperty(this, '_service', withValue(service));
}

merge(Enrollment.prototype, {

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

	_dropLink: function() {
		return this._openEnrollLink();
	},

	isEnrolled: function(course_id) {
		return this._service.get(this._enrolledCoursesWorkspaceItem().href)
		.then(function(result) {
			return result.Items.some(function(item) {
				return item.CourseInstance.NTIID === course_id;
			})
		});
	},

	enrollOpen: function(course_id) {
		var link = this._openEnrollLink();
		return this._service.post(link,{
			NTIID: course_id
		});
	},

	dropCourse: function(course_id) {
		var link = this._dropLink();
		return this._service.delete(link,{
			NTIID: course_id
		});	
	}
});

module.exports = Enrollment;
