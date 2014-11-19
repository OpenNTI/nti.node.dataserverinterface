'use strict';


var Base = require('../Part');

function Matching(service, parent, data) {
	Base.call(this, service, parent, data);
}


Matching.prototype = Object.create(Base.prototype);
Object.assign(Matching.prototype, {
	__contentProperties: Base.prototype.__contentProperties.concat(['values', 'labels']),
	constructor: Matching
});


function parse(service, parent, data) {
	return new Matching(service, parent, data);
}


Matching.parse = parse;


module.exports = Matching;
