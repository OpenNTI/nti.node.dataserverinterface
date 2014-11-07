'use strict';

var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function AssignmentSubmission(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	merge(this, data);
	
	// assignmentId
	// parts --> parse
}

merge(AssignmentSubmission.prototype, base, {


});


function parse(service, parent, data) {
	return new AssignmentSubmission(service, parent, data);
}

AssignmentSubmission.parse = parse;

module.exports = AssignmentSubmission;
