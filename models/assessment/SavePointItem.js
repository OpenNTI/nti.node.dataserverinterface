'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var parser = require('../../utils/parse-object');

function SavePointItem(service, parent, data) {
	var me = this;
	define(me,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(me, data);

	me.Submission = data.Submission && parser(this, data.Submission);
}


Object.assign(SavePointItem.prototype, base, {

	getQuestions: function () {
		return this.Submission ? this.Submission.getQuestions() : [];
	}

});


function parse(service, parent, data) {
	return new SavePointItem(service, parent, data);
}

SavePointItem.parse = parse;

module.exports = SavePointItem;
