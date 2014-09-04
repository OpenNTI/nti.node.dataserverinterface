'use strict';
var Promise = global.Promise || require('es6-promise').Promise;

var EventEmitter = require('events').EventEmitter;
var merge = require('merge');
var getLink = require('../../utils/getlink');
var urlJoin = require('../../utils/urljoin');
var waitFor = require('../../utils/waitfor');
var withValue = require('../../utils/object-attribute-withvalue');

var Bundle = require('../content/Bundle');
var CatalogEntry = require('./CatalogEntry');

function Instance(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	merge(this, data);

	var b = this.ContentPackageBundle = Bundle.parse(service, data.ContentPackageBundle);

	b.on('changed', this.onChange.bind(this));

	this.__pending = [

		this._resolveCatalogEntry()

	].concat(b.__pending || []);
}

merge(Instance.prototype, EventEmitter.prototype, {

	getPresentationProperties: function() {
		var cce = this.CatalogEntry || {getAuthorLine: function(){}},
			bundle = this.ContentPackageBundle;

		return {
			author: cce.getAuthorLine() || bundle.author,
			title: cce.Title || bundle.title,
			label: cce.ProviderUniqueID,
			icon: cce.icon || bundle.icon,
			thumb: cce.thumb || bundle.thumb
		};
	},


	_resolveCatalogEntry: function() {

		function parseCCE(cce) {
			cce = CatalogEntry.parse(service, cce);
			this.CatalogEntry = cce;
			return waitFor(cce.__pending);
		}

		function cacheIt(data) {
			cache.set(url, data);
			return data;
		}

		var service = this._service,
			cache = service.getDataCache(),
			url = getLink(this, 'CourseCatalogEntry'),
			cached = cache.get(url), work;

		if (cached) {
			work = Promise.resolve(cached);
		} else {
			work = service.get(url).then(cacheIt);
		}

		return work.then(parseCCE.bind(this));
	},


	onChange: function(who) {
		this.emit('changed', this, who);
	}

});



function parse(service, data) {
	return new Instance(service, data);
}


Instance.parse = parse.bind(Instance);

module.exports = Instance;
