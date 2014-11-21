'use strict';
/* global Stripe */

var define = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');
var getLink = require('../utils/getlink');

var _pollInterval = 1000;

var Service = require('../stores/Service');

function StripeInterface(server, context) {
	define(this, {
		_server: withValue(server),
		_context: withValue(context)
	});
}

Object.assign(StripeInterface.prototype, {
	getServer: function () { return this._server; },
	get: Service.prototype.get,
	post: Service.prototype.post,


	getPricing: function(purchasable) {
		var link = getLink(purchasable.Links,'price');
		if (link) {
			return this.post(link, {
				purchasableID: purchasable.ID
			});
		}
		throw new Error('Unable to find price link for provided Purchasable');
	},


	getCouponPricing: function(purchasable, coupon) {
		var link = getLink(purchasable.Links, 'price_purchasable_with_stripe_coupon');
		var data = {
				purchasableID: purchasable.ID
			};

		if (coupon) {
			data.Coupon = coupon;
		}

		if (link) {
			return this.post(link, data);
		}

		throw new Error('Unable to find price with coupon link for purchasable');
	},

	getToken: function(stripePublicKey, data) {
		return new Promise(function(fulfill) {
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
		var stripeToken = data.stripeToken.id;
		var purchasable = data.purchasable;
		var pricing = data.pricing;
		var giftInfo = data.giftInfo;
		var linkRel = giftInfo ? 'gift_stripe_payment' : 'post_stripe_payment';
		var pollUrl = giftInfo ? '/dataserver2/store/get_gift_purchase_attempt' : '/dataserver2/store/get_purchase_attempt';
		var paymentUrl = getLink(purchasable.Links, linkRel);
		var payload = {
			PurchasableID: purchasable.ID,
			token: stripeToken,
			context: {
				AllowVenderUpdates: false
			}
		};

		if (giftInfo) {
			payload = Object.assign(payload, giftInfo);
		}

		if (pricing) {
			if (pricing.coupon !== undefined) {
				payload.coupon = pricing.coupon;
			}

			if (pricing.expected_price != undefined) {
				payload.expectedAmount = pricing.expected_price;
			}
		}


		return this.post(paymentUrl, payload)
			.then(function(result) {
				var attempt = result.Items[0];

				return this._pollPurchaseAttempt(attempt.ID, attempt.Creator, pollUrl);
			}.bind(this));
	},


	_pollPurchaseAttempt: function(purchaseId, creator, pollUrl) {
		var me = this;

		return new Promise(function(fulfill, reject) {

			function pollResponse(result) {
				var attempt = result.Items[0];
				if(/^Failed|Success$/i.test(attempt.State)) {
					return fulfill(attempt);
				}

				setTimeout(check, _pollInterval);
			}


			function check() {
				var params = '?purchaseId=' + purchaseId;

				if (creator) {
					params += '&creator=' + creator;
				}

				me.get(pollUrl + params)
					.then(pollResponse)
					.catch(reject);
			}

			check();
		});
	}

});

module.exports = StripeInterface;
