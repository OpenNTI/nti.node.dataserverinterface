'use strict';

var Url = require('url');
//If the login method is invoked on the NodeJS side, we will need this function...
var btoa = global.bota || require('btoa');
var QueryString = require('query-string');
var request = require('../utils/request');

var StripeInterface = require('./Stripe');
var FiveMinuteInterface = require('./FiveMinuteInterface');

var DataCache = require('../utils/datacache');

var define = require('../utils/object-define-hidden-props');

var isBrowser = require('../utils/browser');
var isEmpty = require('../utils/isempty');
var getLink = require('../utils/getlink');
var NTIIDs = require('../utils/ntiids');
var waitFor = require('../utils/waitfor');

var Service = require('../stores/Service');

var jsonContent = /(application|json)/i;
var mightBeJson = /^(\s*)(\{|\[|"|')/i;

var DataServerInterface = function (config) {
	if (!config || !config.server) {
		throw new Error('No configuration');
	}
	this.config = config;
};


Object.assign(DataServerInterface.prototype, {

	/**
	 * Makes a request to the dataserver.
	 *   It should be noted that this is intented to facilitate and abstract the act
	 *   of making a request to the dataserver so it is transparent between nodejs and a
	 *   web browser. Do not use this directly. Only use the interface methods NOT
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
		var opts = Object.assign({}, {
			method: data ? 'POST' : 'GET'
		}, options, {
			url: url//ensure the resolved url is used.
		});

		if ((options || {}).headers !== null) {
			opts.headers = Object.assign( true, ((options || {}).headers || {}), {
				//Always override these headers
				'accept': mime || 'application/json',
				'x-requested-with': 'XMLHttpRequest'
			});
		}

		if(context) {
			opts.headers = Object.assign({},
				context.headers || {},
				opts.headers,
				{'accept-encoding': ''}
			);
		} else if (!isBrowser) {
			throw new Error('Calling request w/o context!');
		}

		if (data) {
			opts.form = data;
			if (typeof data === 'object' && !data._asFORM) {
				opts.headers['Content-type'] = 'application/json';
			}
			delete data._asFORM;
		}

		function getContentType(headers) {
			var reg = /Content-Type/i;
			var key = Object.keys(headers).reduce(function(i, k) {
				return i || (reg.test(k) && k);
			}, null);

			if (key) {
				return headers[key];
			}
		}

		result = new Promise(function(fulfill, reject) {
			if(!isBrowser) {
				console.error('%s REQUEST <- %s %s', new Date().toUTCString(), opts.method, url);
			}

			request(opts, function(error, res, body) {
				if (!res) {
					console.error('%s Request Options: ', new Date().toUTCString(), opts, arguments);
					res = {headers:{}};
				}

				var contentType = getContentType(res.headers);
				var code = res.statusCode;

				try {
					if (isEmpty(contentType) || jsonContent.test(contentType) || mightBeJson.test(body)) {
						body = JSON.parse(body);
					}
				} catch (e) {}//Don't care... let it pass to the client as a string

				if(!isBrowser) {
					console.error('%s REQUEST -> %s %s %s %dms',
						new Date().toUTCString(), opts.method, url, error || code, Date.now() - start);
				}

				if (error || code >= 300 || code === 0) {
					if(res) {
						if (typeof body === 'object') {
							res = Object.assign(body, {
								Message: body.Message || res.statusText,
								statusCode: code
							});
						}
					}
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
				//we get back.  If it's not, we reject.
				if (mime) {
					if (contentType && contentType.indexOf(mime) < 0) {
						return reject('Requested with an explicit accept value of ' +
										mime + ' but got ' + contentType + '.  Rejecting.');
					}
				}


				fulfill(body);
			});
		});

		pending.push(result);
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


	getPurchasables: function (ids, context) {
		var url = '/dataserver2/store/get_purchasables';

		if (ids) {
			if (Array.isArray(ids)) {
				ids = ids.join(',');
			}

			url += '?' + QueryString.stringify({
				purchasables: ids
			});
		}

		return this._get(url, context);
	},


	// Instead of having a method like this on the server interface directly,
	// we should just import the module and construct them in the place we need them.
	// Also, add factory method (.create()) to them so we can require(..).create();

	getStripeInterface: function (context) {
		return new StripeInterface(this, context);
	},

	getFiveMinuteInterface: function(context) {
		return new FiveMinuteInterface(this, context);
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
			}.bind(this))
			.then(function(doc) {
				return waitFor(doc.__pending)
					.then(function() {
						return Promise.resolve(doc);
					});
			});
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
		var auth = password ? ('Basic ' + btoa(username+':'+password)) : undefined;
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

		var me = this;

		return me._get('logon.ping', context)//ping
			//pong
			.then(function(data) {
				var urls = getLink.asMap(data);

				if (!urls['logon.handshake']) {
					return Promise.reject('No handshake present');
				}

				if (context && data && data.Site) {
					define(context,{__nti_site: data.Site});
				}

				return urls;

			})
			.then(function(urls) {

				if (!username) {
					return (!urls['logon.continue']) ?
						//Not logged in... we need the urls
						{links: urls} :
						//There is a continue link, but we need our username to handshake...
						me.getServiceDocument(context)
							.then(function(d) {
								username = d.getAppUsername();
								return me.handshake(urls, username, context);
							});
				}

				return me.handshake(urls, username, context);

			});
	},


	handshake: function (urls, username, context) {
		return this._post(urls['logon.handshake'], {_asFORM: true, username: username}, context)
			.then(function(data) {
				var result = {links: Object.assign({}, urls, getLink.asMap(data))};
				if (!getLink(data, 'logon.continue')) {
					result.reason = 'Not authenticated, no continue after handshake.';
					return Promise.reject(result);
				}
				return result;
			});
	},


	deleteTOS: function(context) {
		return this.ping(context).then(function(result) {
			var link = result.links['content.initial_tos_page'];
			if (link) {
				this._delete(link, context);
			}
			return 'initial_tos_page link not present.';
		}.bind(this));
	},


	recoverUsername: function(email, context) {
		return this.ping(context)
			.then(function(result) {

				return this._post(result.links['logon.forgot.username'], {
					_asFORM: true,
					email: email
				}, context);

			}.bind(this));
	},


	recoverPassword: function(email, username, returnURL, context) {
		return this.ping(context)
			.then(function(result) {

				return this._post(result.links['logon.forgot.passcode'], {
					_asFORM: true,
					email: email,
					username: username,
					success: returnURL
				}, context);

			}.bind(this));
	},


	resetPassword: function(username, newpw, id, context) {
		return this.ping(context)
			.then(function(result) {
				return this._post(result.links['logon.reset.passcode'], {
					_asFORM: true,
					username: username,
					id: id,
					password: newpw
				}, context);
			}.bind(this));
	},


	preflightAccountCreate: function(fields, context) {
		return this.ping(context)
			.then(function(result) {
				return this._request({
					url: result.links['account.preflight.create'],
					headers: {
						'Content-type':'application/json'
					},
					data: JSON.stringify(fields)
				}, context);
			}.bind(this));
	},


	createAccount: function(fields, context) {
		return this.ping(context)
			.then(function(result) {
				return this._request({
					url: result.links['account.create'],
					headers: {
						'Content-type':'application/json'
					},
					data: JSON.stringify(fields)
				}, context);
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
					url.search = QueryString.stringify(Object.assign(
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

		var me = this;

		return Promise.all(ntiids.map(function(n) {
			return me.getObject(n, undefined, context); }))
				.then(function(results) {
					if (!Array.isArray(results)) {results = [results];}
					return results.map(model);
				});

	},


	getPageInfo: function(ntiid, context) {
		var mime = 'application/vnd.nextthought.pageinfo+json';

		if (!NTIIDs.isNTIID(ntiid)) {
			return Promise.reject('Bad NTIID');
		}

		return this.getObject(ntiid, mime, context);
	}
});


module.exports = DataServerInterface;
