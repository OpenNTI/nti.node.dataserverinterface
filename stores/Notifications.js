'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');
var EventEmitter = require('events').EventEmitter;

var objectParser = require('../models/Parser');

var constants = require('../constants');
var forwardFunctions = require('../utils/function-forwarding');
var withValue = require('../utils/object-attribute-withvalue');
var defineProperties = require('../utils/object-define-properties');

var waitFor = require('../utils/waitfor');

var inflight;

function cleanInflight() { inflight = null; }

function Notifications(service, data) {
	console.debug('New Notifications Object... only one should be here.');
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
	forwardFunctions(['every','filter','forEach','map','reduce'], 'Items'), {

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
			.then(resolveUIData.bind(null, s))
			.then(function(data) {
				cache.set(url, data);
				return data;
			});
	} else {
		result = Promise.resolve(cached);
	}

	return result;
}


function resolveUIData(service, data) {
	var pending = [],
		push = pending.push;

	data.Items = data.Items.map(function(o) {
		try {
			o = objectParser(service, null, o);
			push.apply(pending, o.__pending || []);
		} catch(e) {
			console.warn(e.stack);
		}
		return o;
	});

	return waitFor(pending)
		.then(function() { return data; });
}


Notifications.load = function(service, reload) {
	var cache = service.getDataCache();

	if (inflight) {
		return inflight;
	}

	//We need some links...
	inflight = service.getPageInfo(constants.ROOT_NTIID)
		//Find our url to fetch notifications from...
		.then(function(pageInfo) {
			var url = pageInfo.getLink(constants.REL_MESSAGE_INBOX);
			if (!url) {
				return Promise.reject('No Notifications url');
			}

			url = Url.parse(url);

			url.search = objectToQuery({
				batchSize: BATCH_SIZE,
				batchStart: 0
			});

			return url.format();
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

	inflight.then(cleanInflight, cleanInflight);

	return inflight;
};


module.exports = Notifications;
