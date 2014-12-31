'use strict';

function min(a, b) {
	return a < b ? a : b;
}


function max(a, b) {
	return a > b ? a : b;
}


module.exports = function between(i, a, b, inclusive) {
	var x = min(a,b);
	var y = max(a,b);

	return inclusive ?
		(i >= x && i <= y) :
		(i > x && i < y);
};
