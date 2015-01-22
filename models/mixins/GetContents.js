'use strict';

var parse = require('../../utils/parse-object');
var QueryString = require('query-string');

module.exports = {
	getContents: function (params) {
		var link = this.getLink('contents');
		if (!link) {
			return Promise.reject('No Link!?');
		}
		if (typeof params === 'object') {
			link = link.concat('?',QueryString.stringify(params));
		}
		return this._service.get(link)
			.then(function(wrapper){
				wrapper.Items = parse(this, wrapper.Items);
				return wrapper;
			}.bind(this));
	}
};
