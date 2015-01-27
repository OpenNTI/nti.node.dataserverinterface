'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var parser = require('../../utils/parse-object');

function AssignmentFeedbackContainer(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	Object.assign(this, data);

	this.Items = data.Items.map(p=>parser(this, p));
}

Object.assign(AssignmentFeedbackContainer.prototype, base, {

	addPost (body) {
		var link = this.getLink('edit');
		if (!link) {
			return Promise.reject(new Error('No Edit Link'));
		}

		var payload = {
			MimeType: 'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback',
			Class: 'UsersCourseAssignmentHistoryItemFeedback',
			body: Array.isArray(body) ? body : [body]
		};

		return this._service.post(link, payload);
	}

});


module.exports = AssignmentFeedbackContainer;
