'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');
var EventEmitter = require('events').EventEmitter;

var constants = require('../constants');
var forwardFunctions = require('../utils/function-forwarding');
var withValue = require('../utils/object-attribute-withvalue');
var defineProperties = require('../utils/object-define-properties');


function Notifications(service, data) {
	defineProperties(this, {
		_service: withValue(service),
		length: {
			get: this.getLength,
			set: function() {}
		}
	});

	merge(this, data);

	this.lastViewed = new Date(parseFloat(data.lastViewed || 0) * 1000);

	this.onChange = this.onChange.bind(this);
}


merge(Notifications.prototype, EventEmitter.prototype,
	forwardFunctions(['every','forEach','map','reduce'], 'Items'), {

	getLength: function() {
		return (this.Items || []).length;
	},


	onChange: function() {
		this.emit('changed', this);
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


Notifications.load = function(service, reload) {
	var cache = service.getDataCache();

	//We need some links...
	return service.getPageInfo(constants.ROOT_NTIID)
		//Find our url to fetch notifications from...
		.then(function(pageInfo) {
			var url = pageInfo.getLink(constants.REL_MESSAGE_INBOX);
			if (!url) {
				return Promise.reject('No Notifications url');
			}
			return url;
		})

		//Load the notifications...
		.then(function(url) {
			var cached = cache.get(url);
			if (cached) {
				return cached;
			}

			return get(service, url, reload)
				.then(function(data) {
					cache.set(url, data);
					return data;
				});
		})
		.catch(function(reason) {
			console.warn(reason);
			return {};
		})
		//Now we can build the Notifications store object.
		.then(function(data) {
			return new Notifications(service, data);
		});
}


module.exports = Notifications;
