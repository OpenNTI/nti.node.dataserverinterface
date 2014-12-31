'use strict';

var between = require('utils/between');

describe('between', function () {

	it('should not throw errors with odd input', function () {

		expect(between(0)).toBe(false);
		expect(between('0')).toBe(false);
		expect(between(false)).toBe(false);
		expect(between(true)).toBe(false);
		expect(between({})).toBe(false);
		expect(between([])).toBe(false);

		expect(between(1, 0, 'auisdkjh')).toBe(false);

	});

	it('should correctly work with numbers', function () {

		expect(between(0, -1, 1)).toBe(true);
		expect(between(0, -1, 1, false)).toBe(true);
		expect(between(0, -1, 1, true)).toBe(true);
		//order independent
		expect(between(0, 1, -1)).toBe(true);
		expect(between(0, 1, -1, false)).toBe(true);
		expect(between(0, 1, -1, true)).toBe(true);

		expect(between(2, 1, -1, true)).toBe(false);

		expect(between(1, 1, -1, true)).toBe(true);
		expect(between(1, 1, -1, false)).toBe(false);
		expect(between(1, 1, -1)).toBe(false);


		expect(between(1, 0.1, 0.6)).toBe(false);
		expect(between(0.5, 0.1, 0.6)).toBe(true);
	});
});
