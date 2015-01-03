'use strict';

var parseKey = require('../../utils/parse-object-at-key');

module.exports = {
	getContents: function () {
		var link = this.getLink('contents');
		if (!link) {
			return Promise.reject('No Link!?');
		}

		return this._service.get(link)
		.then(function(wrapper){
			parseKey(wrapper, 'Items');
			return wrapper;
		});
	}
};
