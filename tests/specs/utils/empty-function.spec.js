'use strict';

var isFunction = require('utils/isfunction');

var emptyFunction = require('utils/empty-function');
var emptyFunction2 = require('utils/empty-function');

describe('empty function', function () {

	it('should be a function', function () {
		expect(emptyFunction).toBeDefined();
		expect(isFunction(emptyFunction)).toBeTruthy();
	});

	it('should be a singleton', function () {
		expect(emptyFunction).toBe(emptyFunction2);
	});

	it('should be frozen', function() {
		expect(Object.isFrozen(emptyFunction)).toBeTruthy();
	});

	it('should be empty', function() {
		var source = emptyFunction.toString();
		var regex = /^function[^{]*\{(.*)\}\s*$/;
		var body = regex.exec(source);

		expect(body).toBeTruthy();
		expect(emptyFunction.length).toBe(0);

		body = body[1];

		expect(typeof body).toBe('string');
		expect(body.replace(/\s*/,'').length).toBe(0);
	});
});
