'use strict';

var assign = require('../../utils/assign');
var setAndEmit = require('../../utils/getsethandler');

var withValue = require('../../utils/object-attribute-withvalue');
var assets = require('../mixins/PresentationResources');
var base = require('../mixins/Base');

function CourseCatalogEntry(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	assign(this, data);

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

assign(CourseCatalogEntry.prototype, base, assets, {
	isCourse: true,


	getDefaultAssetRoot: function() {
		return '';
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

CourseCatalogEntry.parse = parse;

module.exports = CourseCatalogEntry;
