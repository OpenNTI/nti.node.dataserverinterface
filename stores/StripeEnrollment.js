'use strict';

/* jshint -W098 */ //Delete this comment-line once Promise is referenced.
var Promise = global.Promise || require('es6-promise').Promise;

var assign = require('object-assign');
var withValue = require('../utils/object-attribute-withvalue');
var getLink = require('../utils/getlink');

function StripeEnrollment(service) {
	Object.defineProperty(this, '_service', withValue(service));
}

assign(StripeEnrollment.prototype, {
	getPricing: function(purchasable) {
		var link = getLink(purchasable.Links,'price');
		if (link) {
			return this._service.post(link, {
				purchasableID: purchasable.ID
			});
		}
		throw new Error('Unable to find price link for provided Purchasable');
	},

	getToken: function(stripePublicKey, data) {
		return new Promise(function(fulfill, reject) {
			Stripe.setPublishableKey(stripePublicKey);
			Stripe.card.createToken(data, function(status, response) {
				fulfill({
					status: status,
					response: response
				});
			});	
		});
	},

	submitPayment: function(data) {

		var paymentUrl = getLink(data.purchasable.Links, 'post_stripe_payment');

		var payload = {
			PurchasableID: data.purchasable.ID,
			token: data.stripeToken.id,
			context: {
				AllowVendorUpdates: true
			}
		};

		return this._service.post(paymentUrl, payload);

	}

});

module.exports = StripeEnrollment;

