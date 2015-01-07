'use strict';

var parse = require('../../utils/parse-object');

module.exports = {
	getContents: function () {
		var link = this.getLink('contents');
		if (!link) {
			return Promise.reject('No Link!?');
		}

		return this._service.get(link)
			.then(function(wrapper){
				wrapper.Items = parse(this, wrapper.Items);
				return wrapper;
			}.bind(this));
	}
};
