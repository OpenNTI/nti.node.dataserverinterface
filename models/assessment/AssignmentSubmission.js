'use strict';

var assign = require('../../utils/assign');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function AssignmentSubmission(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	assign(this, data);

	// assignmentId
	// parts --> parse
}

assign(AssignmentSubmission.prototype, base, {


});


function parse(service, parent, data) {
	return new AssignmentSubmission(service, parent, data);
}

AssignmentSubmission.parse = parse;

module.exports = AssignmentSubmission;
