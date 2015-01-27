'use strict';


var Base = require('../Part');

function Ordering(service, parent, data) {
	Base.call(this, service, parent, data);
}


Ordering.prototype = Object.create(Base.prototype);
Object.assign(Ordering.prototype, {
	constructor: Ordering,

	isAnswered () { return true; }
});


module.exports = Ordering;
