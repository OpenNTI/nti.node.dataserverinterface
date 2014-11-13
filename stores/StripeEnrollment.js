'use strict';
/* global Stripe */
var Promise = global.Promise || require('es6-promise').Promise;

var assign = require('object-assign');
var define = require('../../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');
var getLink = require('../utils/getlink');

var _pollInterval = 1000;

function StripeEnrollment(service) {
	define(this, {
		_service: withValue(service)
	});
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
				//if (response.error) {return reject(response.error);}

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

		return this._service.post(paymentUrl, payload)
			.then(function(result) {
				return this._pollPurchaseAttempt(result.Items[0].ID);
			}.bind(this));
	},

	_pollPurchaseAttempt: function(purchaseId) {
		var service = this._service;

		return new Promise(function(fulfill, reject) {

			function pollResponse(result) {
				var attempt = result.Items[0];
				if(/^Failed|Success$/i.test(attempt.State)) {
					return fulfill(attempt);
				}

				setTimeout(check, _pollInterval);
			}


			function check() {
				service.get('/dataserver2/store/get_purchase_attempt?purchaseID=' + purchaseId)
					.then(pollResponse)
					.catch(reject);
			}

			check();
		});
	}

});

module.exports = StripeEnrollment;
