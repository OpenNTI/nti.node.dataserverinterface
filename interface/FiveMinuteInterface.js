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

	preflight: function(data) {
		console.debug('TODO: five minute preflight');
	}
});
