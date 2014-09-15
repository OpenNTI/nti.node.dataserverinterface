'use strict';


var Promise = global.Promise || require('es6-promise').Promise;


var Url = require('url');
var QueryString = require('query-string');
var request = require('../utils/request');
var merge = require('merge');

var DataCache = require('../utils/datacache');

var getLink = require('../utils/getlink');
var clean = require('../utils/object-clean');
var NTIIDs = require('../utils/ntiids');

var Service = require('../stores/Service');


var DataServerInterface = function (config) {
	if (!config || !config.server) {
		throw new Error('No configuration');
	}
	this.config = config;
};

merge(DataServerInterface.prototype, {

	/**
	 * Makes a request to the dataserver.
	 *   It should be noted that this is intented to facilitate and abstract the act
	 *   of making a request to the dataserve so it is transparent between nodejs and a
	 *   web browser.  Do not use this directly.  Only use the interface methods NOT
	 *   prefixed with underscores.
	 *
	 * @param {Object/String} [options] - Request options or URL.
	 * @param {String} [options.url] - The dataserver resource we wish to make the request for, or an absolute url.
	 * @param {String} [options.method] - defaults to GET, and POST if `form` is set.
	 * @param {Object} [options.data] - A dictionary of form values to send with the request.
	 * @param {Object} [options.headers] - HTTP headers to add to the request.
	 * @param {Object} [context] - An active request context to the node's "express" http server.
	 * @returns {Promise}
	 * @private
	 */
	_request: function(options, context) {

		var result;
		var pending = context ? (context.__pendingServerRequests = (context.__pendingServerRequests || [])) : [];
		var start = Date.now();
		var url = (options || {}).url;

		if (!options) {
			options = {};
		}

		if (typeof options === 'string') {
			url = options;
			options = {};
		}

		url = Url.parse(this.config.server).resolve(url || '');

		var mime = (options.headers || {}).accept;
		var data = options.data;
		var opts = merge(true, {
			method: data ? 'POST' : 'GET'
		}, options, {
			url: url//ensure the resolved url is used.
		});

		opts.headers = merge( true, ((options || {}).headers || {}), {
			//Always override these headers
			'accept': mime || 'application/json',
			'x-requested-with': 'XMLHttpRequest'
		});

		if(context) {
			opts.headers = merge(true,
				context.headers || {},
				opts.headers,
				{'accept-encoding': ''}
				);
		}

		if (data) {
			opts.form = data;
		}

		result = new Promise(function(fulfill, reject) {
			console.log('DATASERVER <- [%s] %s %s', new Date().toUTCString(), opts.method, url);

			request(opts, function(error, res, body) {
				var contentType;
				console.log('DATASERVER -> [%s] %s %s %s %dms',
					new Date().toUTCString(), opts.method, url, error || res.statusCode, Date.now() - start);

				if (error || res.statusCode >= 300) {
					if(res) {res.___isResponse = true;}
					return reject(error || res);
				}

				if (res.headers['set-cookie'] && context) {
					context.responseHeaders = context.responseHeaders || {};
					context.responseHeaders['set-cookie'] = res.headers['set-cookie'];
				}

				//If sent an explicit Accept header the server
				//may return a 406 if the Accept value is not supported
				//or it may just return whatever it wants.  If we send
				//Accept we check the Content-Type to see if that is what
				//we get back.  If it's not we reject.
				if (mime) {
					contentType = res['Content-Type'];
					if (contentType && contentType.indexOf(mime) < 0) {
						return reject('Requested with an explicit accept value of ' + mime + ' but got ' + contentType + '.  Rejecting.');
					}
				}

				try {
					fulfill(body && JSON.parse(body));
				} catch (e) {
					fulfill(body);
				}
			});
		});

		pending.push(result)
		return result;
	},


	_get: function(url, context) {
		return this._request(url, context);
	},


	_post: function(url, data, context) {
		return this._request({
			url: url,
			method: 'POST',
			data: data
		}, context);
	},


	_put: function(url, data, context) {
		return this._request({
			url: url,
			method: 'PUT',
			data: data
		}, context);
	},


	_delete: function(url, context) {
		return this._request({
			url: url,
			method: 'DELETE'
		}, context);
	},


	getServiceDocument: function(context) {
		var cache = DataCache.getForContext(context),
			cached = cache.get('service-doc-instance'),
			promise;

		//Do we have an instance?
		if (cached) {
			return Promise.resolve(cached);
		}

		//Do we have the data to build an instance?
		cached = cache.get('service-doc');
		if (cached) {
			promise = Promise.resolve(new Service(cached, this, context));
		//No? okay... get the data and build and instance
		} else {
			promise = this._get(null, context).then(function(json) {
				cache.set('service-doc', json);
				return new Service(json, this, context);
			}.bind(this));
		}

		//once we have an instance, stuff it in the cache so we don't keep building it.
		promise.then(function(instance) {
			cache.setVolatile('service-doc-instance', instance);
		});

		//Return a promise that will fulfill with the instance...
		return promise;
	},


	logInPassword: function(url,credentials) {
		var username = credentials ? credentials.username : undefined;
		var password = credentials ? credentials.password : undefined;
		var auth = password ? ('Basic '+btoa(username+':'+password)) : undefined;
		var options = {
			url: url,
			method: 'GET',
			xhrFields: { withCredentials: true },
			headers: {
				Authorization: auth
			}
		};
		return this._request(options);
	},


	logInOAuth: function(url) {
		return this._request({
			url: url
		});
	},


	ping: function(context, username) {
		username = username || (context && context.cookies && context.cookies.username);

		return this._get('logon.ping', null, context)//ping
			//pong
			.then(function(data) {
				var urls = getLink.asMap(data);

				if (!urls['logon.handshake']) {
					return Promise.reject('No handshake present');
				}

				return urls;

			}.bind(this))
			.then(function(urls) {

				if (!username) {
					return {links: urls};
				}

				return this._post(urls['logon.handshake'], {username: username}, context)
					.then(function(data) {
						var result = {links: merge(true, urls, getLink.asMap(data))};
						if (!getLink(data, 'logon.continue')) {
							result.reason = 'Not authenticated, no continue after handshake.';
							return Promise.reject(result);
						}
						return result;
					});

			}.bind(this));
	},


	getObject: function(ntiid, mime, context) {
		if (!NTIIDs.isNTIID(ntiid)) {
			return Promise.reject('Bad NTIID');
		}

		return this.getServiceDocument(context)
			.then(function(doc) {
				var headers = {},
					url = doc.getObjectURL(ntiid);

				if (mime) {
					url = Url.parse(url);
					url.search = QueryString.stringify(merge(
						QueryString.parse(url.query), {
							type: mime
						}));

					url = url.format();
					headers.accept = mime;
				}

				return this._request({url: url, headers: headers}, context);
			}.bind(this));
	},


	getObjects: function(ntiids, context) {
		if (!Array.isArray(ntiids)) {
			ntiids = [ntiids];
		}

		function model(o) {
			return o && o.MimeType ? o : null;
		}

		return Promise.all(ntiids.map(function(n) {
			return me.getObject(n, undefined, context); }))
				.then(function(results) {
					if (!Array.isArray(results)) {results = [results];}
					return results.map(model);
				});

	},


	getPageInfo: function(ntiid, context) {
		var url,
			mime = 'application/vnd.nextthought.pageinfo+json';

		if (!NTIIDs.isNTIID(ntiid)) {
			return Promise.reject('Bad NTIID');
		}

		return this.getObject(ntiid, mime, context);
	}
});


module.exports = DataServerInterface;
