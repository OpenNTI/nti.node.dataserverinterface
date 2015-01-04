'use strict';


var Base = require('../Part');

function FillInTheBlank(service, parent, data) {
	Base.call(this, service, parent, data);
}


FillInTheBlank.prototype = Object.create(Base.prototype);
Object.assign(FillInTheBlank.prototype, {
	__contentProperties: Base.prototype.__contentProperties.concat(['input']),
	constructor: FillInTheBlank
});


function parse(service, parent, data) {
	return new FillInTheBlank(service, parent, data);
}


FillInTheBlank.parse = parse;


module.exports = FillInTheBlank;
