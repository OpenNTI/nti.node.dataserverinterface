'use strict';

//var et = require('elementtree');
var merge = require('merge');
var base = require('./mixins/Base');

//var PageSource = require('./TableOfContentsBackedPageSource');

//var forwardFunctions = require('../utils/function-forwarding');
var defineProperties = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');

function TablesOfContents(service, parent, tables) {
	defineProperties(this, {
		_service: withValue(service),
		_parent: withValue(parent),
		_tables: withValue(tables)
	});
}


merge(TablesOfContents.prototype, base, {

	getNode: function(id) {
		return this._tables.reduce(function(found, toc) {
			return found || toc.getNode(id);
		}, null);
	}

});


module.exports = TablesOfContents;
