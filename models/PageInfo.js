'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');
var base = require('./mixins/Base');
var Url = require('url');
var path = require('path');

var constants = require('../constants');

var withValue = require('../utils/object-attribute-withvalue');
var toQueryString = require('../utils/object-to-querystring');
var fixRefs = require('../utils/rebase-references');
var NTIIDs = require('../utils/ntiids');

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
	},


	getPackageID: function () {
		function bestGuess(p) {
			throw new Error('PageInfo does not declare the package ID.');
		}

		return this.ContentPackageNTIID || bestGuess(this);
	},


	getUserDataLastOfType: function (mimeType) {
		var link = this.getLink(constants.REL_USER_GENERATED_DATA);
		var url = link && Url.parse(link);
		var o = {
			accept: mimeType,
			batchStart: 0, batchSize: 1,
			sortOn: 'lastModified',
			sortOrder: 'descending',
			filter: 'TopLevel'
		};

		if (!url) {
			return Promise.reject('No Link');
		}

		url.search = toQueryString(o);

		return this.getResource(url.format());
	}
});



function parse(service, data) {
	return new PageInfo(service, data);
}

PageInfo.parse = parse.bind(PageInfo);

module.exports = PageInfo;
