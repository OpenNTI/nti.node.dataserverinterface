'use strict';

/**
* Constructs an enumeration with keys equal to namespace:key.
* For example:
*	namespacedKeyMirror('example', { key1: null, key2: null });
* 	{key1: 'example:key1', key2: 'example:key2'}
*/
module.exports = function namespacedKeyMirror(namespace, object, separator) {
	var namespace = namespace||'';
	var separator = separator||':';
	var result = {};
	var key;
	for(key in object) {
		if (!object.hasOwnProperty(key)) {
			continue;
		}
		result[key] = namespace.concat(separator, key);
	}
	return result;
};
