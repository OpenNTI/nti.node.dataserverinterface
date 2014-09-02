'use strict';

module.exports = function deepFreeze (o) {
	var prop, propKey;
	Object.freeze(o); // First freeze the object.
	for (propKey in o) {
		prop = o[propKey];
		if (o.hasOwnProperty(propKey) && prop instanceof Object && !Object.isFrozen(prop)) {
			// If the object is on the prototype, not an object, or is already frozen,
			// skip it. Note that this might leave an unfrozen reference somewhere in the
			// object if there is an already frozen object containing an unfrozen object.
			deepFreeze(prop); // Recursively call deepFreeze.
		}
	}
};
