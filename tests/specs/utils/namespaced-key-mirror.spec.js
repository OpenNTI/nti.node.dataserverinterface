'use strict';

var nsKeyMirror = require('utils/namespaced-key-mirror');

describe('namespaced-key-mirror', function () {

	var input = {
		key1: null,
		key2: null
	};

	var namespace = 'test';

	it('should return an object with values equal to namespace:key', function () {
		var expectedOutput = {
			key1: 'test:key1',
			key2: 'test:key2'
		};
		expect(nsKeyMirror(namespace, input)).toEqual(expectedOutput);
	});

	it('should return keys equal to values if no namespace is given', function() {
		var expectedOutput = {
			key1: 'key1',
			key2: 'key2'
		};
		expect(nsKeyMirror(null, input)).toEqual(expectedOutput);
	});

	it('should use the specified separator', function() {

		var separator = '-';

		var expectedOutput = {
			key1: 'test-key1',
			key2: 'test-key2'
		};
		
		expect(nsKeyMirror(namespace, input, separator)).toEqual(expectedOutput);
	});

});
