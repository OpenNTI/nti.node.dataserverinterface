'use strict';

var applyIf = require('utils/applyif');

describe('applyIf', function () {

	it('should modifiy the first object and return it', function () {
		var a = {}, b;

		b = applyIf(a, {test: 2});

		expect(b).toBe(a);
		expect(a).toEqual({test: 2});
	});

	it('should apply keys only if that key is null/undefined', function () {
		expect(applyIf({test:0}, {a: '1', test: 2})).toEqual({test: 0, a: '1'});
		expect(applyIf({test:null}, {a: '1', test: 2})).toEqual({test: 2, a: '1'});
		expect(applyIf({test:undefined}, {a: '1', test: 2})).toEqual({test: 2, a: '1'});
	});

});
