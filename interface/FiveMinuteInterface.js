/**
 * This is an OU API, perhaps we should bury this deeper in to the package?
 *
 * Like:
 *	/interface/thirdparties/ou/FiveMinute.js
 *
 */
'use strict';

var define = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');

var Service = require('../stores/Service');

function FiveMinuteInterface(server, context) {
	define(this, {
		_server: withValue(server),
		_context: withValue(context)
	});
}

Object.assign(FiveMinuteInterface.prototype, {
	getServer: function () { return this._server; },
	get: Service.prototype.get,
	post: Service.prototype.post,

	_getAppUser: function() {
		//This doesn't leverage our instance cache. This will create a new Service Doc instance (as
		// well as a new App User model instance)
		return this._server.getServiceDocument().then(function(doc) {
			return doc.getAppUser();
		});
	},

	getAdmissionStatus: function() {

		return this._getAppUser().then(function(user) {
			return (user||{}).fmaep_admission_state;
		});
	},

	_getUserLink: function(rel) {
		return this._getAppUser().then(function(user) {
			return user.getLink(rel);
		});
	},

	preflight: function(data) {

		// get the preflight link.
		var p = this._getUserLink('fmaep.admission.preflight');

		// post the data to the link
		var r = p.then(function(link) {
			return this.post(link, data);
		}.bind(this));

		return r;
	},

	requestAdmission: function(data) {
		console.debug('five minute service requestAdmission');
		var getLink = this._getUserLink('fmaep.admission');
		var r = getLink.then(function(link) {
			return this.post(link, data);
		}.bind(this));
		return r;
	},

	getPayAndEnroll: function(link, ntiCrn, ntiTerm, returnUrl) {
		console.debug(link);
		var r = this.post(link, {
			crn: ntiCrn,
			term: ntiTerm,
			return_url: returnUrl
		});
		return r;
	}
});

module.exports = FiveMinuteInterface;
