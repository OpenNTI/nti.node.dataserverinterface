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


});


module.exports = AssignmentFeedbackContainer;
