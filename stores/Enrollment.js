'use strict';

/* jshint -W098 */ //Delete this comment-line once Promise is referenced.
var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');
var withValue = require('../utils/object-attribute-withvalue');

function Enrollment(service) {
	Object.defineProperty(this, '_service', withValue(service));
}

merge(Enrollment.prototype, {

	_openEnrollLink: function() {
		var workspace = this._service.getWorkspace('Courses');
		var result = null;
		workspace.Items.every(function(item) {
			if(item.Title === 'EnrolledCourses') {
				result = item.href;
			}
			return !result;
		});
		return result;
	},

	enrollOpen: function(course_id) {
		var link = this._openEnrollLink();
		return this._service.post(link,{
			NTIID: course_id
		});
	}
});

module.exports = Enrollment;
