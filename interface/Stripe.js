'use strict';
/* global Stripe */

var define = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');
var getLink = require('../utils/getlink');

var _pollInterval = 1000;

var Service = require('../stores/Service');

function Stripe(server, context) {
	define(this, {
		_server: withValue(server),
		_context: withValue(context)
	});
}

Object.assign(Stripe.prototype, {
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

		var paymentUrl = getLink(data.purchasable.Links, 'post_stripe_payment');

		var payload = {
			PurchasableID: data.purchasable.ID,
			token: data.stripeToken.id,
			context: {
				AllowVendorUpdates: false
			}
		};

		return this.post(paymentUrl, payload)
			.then(function(result) {
				return this._pollPurchaseAttempt(result.Items[0].ID);
			}.bind(this));
	},

	_pollPurchaseAttempt: function(purchaseId) {
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
				me.get('/dataserver2/store/get_purchase_attempt?purchaseID=' + purchaseId)
					.then(pollResponse)
					.catch(reject);
			}

			check();
		});
	}

});

module.exports = Stripe;
