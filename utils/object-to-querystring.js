'use strict';

/**
 * Serializes an object to be submitted as part of an web/ajax request.
 * @method toQueryString
 * @param {Object} o The object to serialize.
 * @return {String} Serialized, URI-encoded, querystring form of the given object.
 */
module.exports = function toQueryString(o) {
	var k, t,string = [];
	for(k in o){
		if(o.hasOwnProperty(k)){
			t = typeof o[k];
			if(t==='string' || t==='boolean' || t==='number') {
				string.push([encodeURIComponent(k),encodeURIComponent(o[k])].join('='));
			} else {
				console.log(typeof o[k], k, o[k]);
			}
		}
	}
	return string.join('&');
};
