'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');
var EventEmitter = require('events').EventEmitter;

var forwardFunctions = require('../utils/function-forwarding');
var withValue = require('../utils/object-attribute-withvalue');
//var identity = require('../utils/identity');
var waitFor = require('../utils/waitfor');

var Entry = require('../models/courses/CatalogEntry');

function Catalog(service, data) {
	var pending = this.__pending = [];
	Object.defineProperty(this, '_service', withValue(service));

	merge(this, data);

	this.onChange = this.onChange.bind(this);


	function queue(p) {
		Array.prototype.push.apply(pending, p && p.__pending);
	}

	this.Items = data.Items.map(function(entry) {
		entry = Entry.parse(service, entry);
		queue(entry);
		entry.on('changed', this.onChange);
		return entry;
	}
	.bind(this));
	//.filter(identity);//strip falsy items
}


merge(Catalog.prototype, EventEmitter.prototype,
	forwardFunctions(['every','filter','forEach','map','reduce'], 'Items'), {


	onChange: function() {
		this.emit('changed', this);
	},


	findEntry: function(entryId) {
		var found;

		this.every(function(course) {
			if (course.getID() === entryId) {
				found = course;
			}

			return !found;
		});

		return found;
	}
});


function get(s, url, ignoreCache) {
	var cache = s.getDataCache();

	var cached = cache.get(url), result;
	if (!cached || ignoreCache) {
		result = s.get(url)
			.catch(function empty () { return {titles: [], Items: []}; })
			.then(function(data) {
				cache.set(url, data);
				return data;
			});
	} else {
		result = Promise.resolve(cached);
	}

	return result;
}


Catalog.load = function(service, reload) {
	return get(service, service.getCoursesCatalogURL(), reload)
		.then(function(data) {
			var catalog = new Catalog(service, data);
			return waitFor(catalog.__pending)
				.then(function() {
					return catalog;
				});
			});
};


module.exports = Catalog;
