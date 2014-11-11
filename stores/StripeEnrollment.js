'use strict';

/* jshint -W098 */ //Delete this comment-line once Promise is referenced.
var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');
var withValue = require('../utils/object-attribute-withvalue');
var getLink = require('../utils/getlink');

function StripeEnrollment(service) {
	Object.defineProperty(this, '_service', withValue(service));
}

merge(StripeEnrollment.prototype, {
	getPricing: function(purchasable) {
		var link = getLink(purchasable.Links,'price');
		if (link) {
			return this._service.post(link, {
				purchasableID: purchasable.ID
			});
		}
		throw new Error('Unable to find price link for provided Purchasable');
	}
});

module.exports = StripeEnrollment;
