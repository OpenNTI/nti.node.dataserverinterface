'use strict';

var assign = require('object-assign');

var Base = require('../Part');

function MultipleChoice(service, parent, data) {
	Base.call(this, service, parent, data);
}


MultipleChoice.prototype = Object.create(Base.prototype);
assign(MultipleChoice.prototype, {
	__contentProperties: Base.prototype.__contentProperties.concat(['choices']),
	constructor: MultipleChoice
});


function parse(service, parent, data) {
	return new MultipleChoice(service, parent, data);
}


MultipleChoice.parse = parse;


module.exports = MultipleChoice;
