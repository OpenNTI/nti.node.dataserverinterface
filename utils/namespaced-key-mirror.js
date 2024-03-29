'use strict';

/**
* Constructs an enumeration with keys equal to namespace:key.
* For example:
*	namespacedKeyMirror('example', { key1: null, key2: null });
* 	{key1: 'example:key1', key2: 'example:key2'}
* 
*  @param {String} namespace - values will be prefixed with this string. if not provided
*	returns an object with values equal to keys.
*  @param {Object} object - Object with keys to be mirrored.
*  @param {String} separator - the separator to be used between the namespace and value; defaults to ':'
*/
module.exports = function namespacedKeyMirror(namespace, object, separator) {

	if(namespace && typeof namespace !== 'string') {
		throw new Error('If namespace is provided it must be a string.');
	}

	if(!object || typeof object !== 'object') {
		throw new Error('object parameter is required and should be an object.');
	}

	var separator = separator||':';
	var prefix = namespace ? namespace.concat(separator||':') : '';
	var result = {};
	var key;
	for(key in object) {
		if (object.hasOwnProperty(key)) {
			result[key] = prefix.concat(key);
		}
	}
	return result;
};
