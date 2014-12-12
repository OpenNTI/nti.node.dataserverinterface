'use strict';

var toArray = require('utils/toarray');

describe('toArray', function () {
	var abc = ['a', 'b', 'c'];
	var empty3 = new Array(3);
	var empty = [];

	var a = {0: 'a', 1: 'b', 2: 'c', length: 3};
	var b = {length: 3};

	it('should convert object with length to array of length', function () {
		expect(toArray(a)).toEqual(abc);
		expect(toArray(b)).toEqual(empty3);

		expect(toArray('abc')).toEqual(abc);
		expect(toArray({})).toEqual(empty);
	});


	it('should return [] for invalid input', function () {
		expect(toArray(1)).toEqual(empty);
		expect(toArray(true)).toEqual(empty);
		expect(toArray(false)).toEqual(empty);
		expect(toArray(NaN)).toEqual(empty);
		expect(toArray(undefined)).toEqual(empty);
		expect(toArray(null)).toEqual(empty);
		expect(toArray()).toEqual(empty);
	});

});
