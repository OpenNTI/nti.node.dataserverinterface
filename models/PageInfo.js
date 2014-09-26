'use strict';

var merge = require('merge');
var base = require('./mixins/Base');
var Url = require('url');
var path = require('path');

var withValue = require('../utils/object-attribute-withvalue');
var fixRefs = require('../utils/rebase-references');

function PageInfo(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	merge(this, data);
}


merge(PageInfo.prototype, base, {

	getContent: function() {
		var url = this.getLink('content');

		return this._service.get(url)
			.then(function (html){
				url = Url.parse(url);
				url.pathname = path.dirname(url.pathname) + '/';

				return fixRefs(html, url.format());
			});
	},


	getResource: function(url) {
		return this._service.get(url);
	}

});



function parse(service, data) {
	return new PageInfo(service, data);
}

PageInfo.parse = parse.bind(PageInfo);

module.exports = PageInfo;
