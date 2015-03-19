'use strict';

var isFunction = require('utils/isfunction');

describe('isFunction', function () {

	it('should identify a function', function () {
		expect(isFunction).toBeDefined();

		expect(isFunction(function(){})).toBeTruthy();

		expect(isFunction()).toBeFalsy();
		expect(isFunction({})).toBeFalsy();
		expect(isFunction(null)).toBeFalsy();
		expect(isFunction(undefined)).toBeFalsy();
		expect(isFunction(1)).toBeFalsy();
		expect(isFunction('a')).toBeFalsy();
		expect(isFunction(false)).toBeFalsy();
	});

});
