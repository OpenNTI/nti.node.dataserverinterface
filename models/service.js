'use strict';

var merge = require('merge');

var getLink = require('../utils/getlink.js');


var ServiceDocument = function (json) {
	merge(this, json);
};

merge(ServiceDocument.prototype, {

	getUserWorkspace: function() {
		var workspace;
		this.Items.every(function(o) {
			if (getLink(o, 'ResolveSelf')) {
				workspace = o;
			}
			return !workspace;
		});

		return workspace;
	}

});

module.exports = ServiceDocument;
