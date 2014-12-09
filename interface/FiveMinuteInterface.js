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
var getLink = require('../utils/getlink');

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
		return this._server.getServiceDocument().then(function(doc) {
			return doc.getAppUser();
		});
	},

	getAdmissionStatus: function() {
		return this._getAppUser().then(function(user) {
			return (user||{}).fmaep_admission_state;
		});
	},

	preflight: function(data) {
		console.debug('TODO: five minute preflight');
	}
});

module.exports = FiveMinuteInterface;
