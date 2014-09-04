'use strict';
var Promise = global.Promise || require('es6-promise').Promise;

var EventEmitter = require('events').EventEmitter;
var merge = require('merge');
var getLink = require('../../utils/getlink');
var urlJoin = require('../../utils/urljoin');
var waitFor = require('../../utils/waitfor');
var withValue = require('../../utils/object-attribute-withvalue');

var Bundle = require('../content/Bundle');

function Instance(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	merge(this, data);

	var b = this.ContentPackageBundle = Bundle.parse(service, data.ContentPackageBundle);

	b.on('changed', this.onChange.bind(this));

	function parseCCE(cce) {
		cce = CatalogEntry.parse(service, cce);
		this.CatalogEntry = cce;
		return waitFor(cce.__pending);
	}

	this.__pending = [

		service.get(getLink(this, 'CourseCatalogEntry')).then(parseCCE.bind(this))

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


	onChange: function(who) {
		this.emit('changed', this, who);
	}

});



function parse(service, data) {
	return new Instance(service, data);
}


Instance.parse = parse.bind(Instance);

module.exports = Instance;
