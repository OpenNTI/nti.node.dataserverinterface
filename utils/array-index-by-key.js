'use strict';

/*
 * Maps the given object array, indexed by element[key].
 * Example:
 * var in = [{name:'banana', color:'yellow'}, {name:'apple', color:'red'}];
 * Utils.indexArrayByKey(in,'name') returns:
 * {
 * 	'banana': {name:'banana', color:'yellow'},
 * 	'apple': {name:'apple', color:'red'}
 * }
 * Note: No attempt is made to prevent items with
 * the same key from stomping each other.
 */
module.exports = function indexArrayByKey(arr, key) {
	var result = {};

	for(let item of arr) {
		result[item[key]] = item;
	}

	return result;
};
