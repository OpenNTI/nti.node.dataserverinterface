'use strict';


/**
 * This is for Objects within an assignment history item.
 */

var getLink = require('../../utils/getlink');

module.exports = {

__resolveNames: function (service) {
	var me = this;

	var courseInstanceUrl = (me.getLink('AssignmentHistoryItem') || me.href || '').replace(/\/AssignmentHistories.*/, '');

	var assignmentId = me.AssignmentId;
	var a, b;


	//If this model has an assignment parent model instance,
	a = this.parent('MimeType', /assessment.assignment$/i);
	a = (a ?
	//... the assignment title is already known... use it.
		Promise.resolve(a) :
	//Otherwise, load the assignment object
		service.getObject(assignmentId)
	)
	//then... Pluck the assignment object title...
		.then(function (assignment) {
			me.AssignmentName = assignment.title; });



	//This is really dirty (IMO),
	//TODO: Find a better way to resolve the "Course Name"
	b = service.get(courseInstanceUrl).then(function(courseInstanceData) {
			//OMG, ICK! Yet another request...
			return service.get(getLink(courseInstanceData, 'CourseCatalogEntry'));
		})

		//Okay, the scary part is over! just grab what we need and run.
		.then(function(catalogEntryData) {
			me.CourseName = catalogEntryData.Title;
		});


	//Wait on the two async operations (a and b), then fire a change
	// event so views know values changed.
	return Promise.all([a, b]).then(function() {
		me.emit('change');
	});
}

};
