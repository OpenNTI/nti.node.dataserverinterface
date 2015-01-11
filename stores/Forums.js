'use strict';

var define = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');

var parser = require('../utils/parse-object');
var NTIID = require('../utils/ntiids');

function Forums(service) {
	define(this, {
		_service: withValue(service)
	});
}

Object.assign(Forums.prototype, {

	getObject: function(ntiid) {
		ntiid = NTIID.decodeFromURI(ntiid);
		return this._service.getObject(ntiid)
			.then(parser.bind(this, this));
	}
});

module.exports = Forums;
