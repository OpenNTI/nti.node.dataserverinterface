'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');
var EventEmitter = require('events').EventEmitter;

var constants = require('../constants');
var withValue = require('../utils/object-attribute-withvalue');


function Notifications(service) {

	Object.defineProperty(this, '_service', withValue(service));

	this.onChange = this.onChange.bind(this);
}


merge(Notifications.prototype, EventEmitter.prototype, {

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

	return result.then(function(data) {
		debugger;
		return data;
	});
}


Notifications.load = function(service, reload) {
	//get(service, url)
	return service.getPageInfo(constants.ROOT_NTIID)
		.then(function(data) {
			
		});
}


module.exports = Notifications;
/*
Service.getPageInfo(Globals.CONTENT_ROOT,
	//success:
	function(pageInfo) {
		var url = pageInfo.getLink(Globals.MESSAGE_INBOX);
		if (!url) {
			console.error('No Notifications url');
			url = 'bad-notifications-url';
		}

		store.lastViewed = new Date(0);

		Service.request(url + '/lastViewed')
				.then(function(lastViewed) {
					store.lastViewed = new Date(parseFloat(lastViewed) * 1000);
				})
				.fail(function() {
					console.warn('Could not resolve notification`s lastViewed');
				})
				.then(function() {
					store.proxy.proxyConfig.url = url;
					store.url = store.proxy.url = url;

					console.debug('Loading notifications: ' + url);
					store.load();
				});
	},
	//failure:
	function() {
		console.error('Could not setup notifications!');
	},
	this);
*/
