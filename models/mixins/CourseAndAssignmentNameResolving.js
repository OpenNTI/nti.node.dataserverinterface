'use strict';


/**
 * This is for Objects within an assignment history item.
 */

var objectForEach = require('../../utils/object-each');
var getLink = require('../../utils/getlink');

module.exports = {

__resolveNames: function (service) {
	var me = this;
	var url = me.getLink('AssignmentHistoryItem') || me.href;

	url = url && url.replace(/\/AssignmentHistories.*/, '');

	var getCourseInstance = service.get(url);
	var assignmentId = me.AssignmentId;
	var a, b;

	a = getCourseInstance
		.then(function(courseInstanceData) {
			return service.get(getLink(courseInstanceData, 'AssignmentsByOutlineNode'));
		})
		.then(function(assignments) {
			var assignment;
			objectForEach(assignments, function(v) {
				if (Array.isArray(v) && !assignment){
					assignment = v.reduce(function(a, b){
						return a || b.NTIID === assignmentId && b;
					}, null);
				}
			});

			me.AssignmentName = assignment && assignment.title;
		});

	b = getCourseInstance
		.then(function(courseInstanceData) {
			return service.get(getLink(courseInstanceData, 'CourseCatalogEntry'));
		})
		.then(function(catalogEntryData) {
			me.CourseName = catalogEntryData.Title;
		});

	return Promise.all([a, b]).then(function() {
		me.emit('change');
	});
}

};
