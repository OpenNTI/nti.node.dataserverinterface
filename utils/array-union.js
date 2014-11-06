'use strict';

function dedup(uniqueSet, currentValue) {
	if(uniqueSet.indexOf(currentValue) === -1) {
		uniqueSet.push(currentValue);
	}
	return uniqueSet;
}

module.exports = function union(arrayA, arrayB) {
	return arrayA.concat(arrayB).reduce(dedup,[]);
};
