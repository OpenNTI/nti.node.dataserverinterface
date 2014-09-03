'use strict';

var merge = require('merge');
var EventEmitter = require('events').EventEmitter;

var withValue = require('../utils/object-attribute-withvalue');
var DataCache = require('../utils/datacache');

var Package = require('../models/content/Package');

function Library(service, name, data) {
	Object.defineProperty(this, '_service', withValue(service));

	//Lets not confuse content packages as "titles"
	if (data.titles && !data.packages) {
		data.packages = data.titles;
		delete data.titles;
	}

	this.onChange = this.onChange.bind(this);

	data.packages = data.packages.map(function(pkg) {
		pkg = Package.parse(service, pkg);
		pkg.on('change', onChange);
		return pkg;
	}.bind(this));

	merge(this, data);
}


merge(Library.prototype, EventEmitter.prototype, {

	onChange: function() {
		this.emit('changed', this);
	}
});



Library.load = function(service, name, req) {
	var svr = service.getServer();
	var cacheKey = 'library-' + name;
	var cache = DataCache.getForRequest(req);
	var cached = cache.get(cacheKey);

	function make (data) {
		return new Library(service, name, data);
	}

	if (cached) {
		return Promise.resolve(make(cached));
	}

	return svr._get(service.getLibraryURL(), req)
		.then(function(data) {
			cache.set(cacheKey, data);
			return make(data);
		});
}

module.exports = Library;
