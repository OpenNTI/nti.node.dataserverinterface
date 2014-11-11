'use strict';

var assign = require('object-assign');
var clean = require('../../../utils/sanitize-markup');

var Base = require('../Part');

var pars = /<(\/)?p([^>]*)>/igm;

function MultipleChoice(service, parent, data) {
	Base.call(this, service, parent, data);

	this.choices = this.choices.map(function(s) {
		s = s && clean(s);
		return s && s.replace(pars, '').trim();
	});
}


MultipleChoice.prototype = Object.create(Base.prototype);
assign(MultipleChoice.prototype, {
	constructor: MultipleChoice
});


function parse(service, parent, data) {
	return new MultipleChoice(service, parent, data);
}


MultipleChoice.parse = parse;


module.exports = MultipleChoice;
