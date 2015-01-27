'use strict';


var base = require('../mixins/Base');
var names = require('../mixins/CourseAndAssignmentNameResolving');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function AssignmentFeedback(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});


	Object.assign(this, data);
	this.__pending = [
		this.__resolveNames(service)
	];
}

Object.assign(AssignmentFeedback.prototype, base, names, {

	delete () {
		var link = this.getLink('edit');
		if (!link) {
			return Promise.reject(new Error('No Edit Link'));
		}

		return this._service.delete(link);
	},


	editBody (body) {
		var link = this.getLink('edit');
		if (!link) {
			return Promise.reject(new Error('No Edit Link'));
		}

		this.body = body;

		return this._service.put(link, this.getData());
	}

});


module.exports = AssignmentFeedback;
