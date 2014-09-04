'use strict';

var EventEmitter = require('events').EventEmitter;
var merge = require('merge');
var setAndEmit = require('../../utils/getsethandler');
var urlJoin = require('../../utils/urljoin');
var withValue = require('../../utils/object-attribute-withvalue');
var assets = require('../mixins/PresentationResources');

function CourseCatalogEntry(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	merge(this, data);

	this.author = (data.DCCreator || []).join(', ');

	if (!this.ContentPackages) {
		this.ContentPackages = [this.ContentPackageNTIID];
	}

	this.__pending = [
		this.getAsset('landing').then(setAndEmit(this, 'icon')),
		this.getAsset('thumb').then(setAndEmit(this, 'thumb')),
		this.getAsset('background').then(setAndEmit(this, 'background'))
	];
}

merge(CourseCatalogEntry.prototype, assets, EventEmitter.prototype, {
	isBundle: true,


	onChange: function(who) {
		this.emit('changed', this, who);
	},


	getDefaultAssetRoot: function() {
		var root = ([this].concat(this.ContentPackages))
				.reduce(function(agg, o) { return agg || o.root; }, null);

		if (!root) {
			console.error('No root for bundle: ', this);
			return '';
		}

		return urlJoin(root, 'presentation-assets', 'webapp', 'v1');
	},


	getAuthorLine: function() {
		function makeName(instructor) {
			return instructor.Name;
		}


		function notTA(instructor) {
			return !taRe.test(instructor.JobTitle);
		}

		var taRe = (/Teaching Assistant/i),
			instructors = this.Instructors;

		return (instructors && instructors.filter(notTA).map(makeName).join(', ')) || '';
	}

});



function parse(service, data) {
	return new CourseCatalogEntry(service, data);
}

CourseCatalogEntry.parse = parse.bind(Bundle);

module.exports = CourseCatalogEntry;
