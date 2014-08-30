'use strict';


var Promise = global.Promise || require('es6-promise').Promise;


var Url = require('url');
var request = require('../utils/request');
var merge = require('merge');

var getLink = require('../utils/getlink');
var clean = require('../utils/object-clean');

var service = require('../models/service');


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
	 * @param {String} [link] - The dataserver resource we wish to make the request for.
	 * @param {Object} [options] - Request options
	 * @param {Object} [options.method] - defaults to GET, and POST if `form` is set.
	 * @param {Object} [options.form]
	 * @param {Object} [options.headers]
	 * @param {Object} [data] - A dictionary of form values to send with the request.
	 * @param {Object} [req] - An active request to the node's "express" http server.
	 * @returns {Promise}
	 * @private
	 */
	_request: function(link, options, data, activeRequest) {

		var url = Url.parse(this.config.server).resolve(link || '');
		var start = Date.now();

		var opts = merge(true, {
			url: url,
			method: data ? 'POST' : 'GET'
		}, options);

		opts.headers = merge( true, ((options || {}).headers || {}), {
			//Always override these headers
			'accept': 'application/json',
			'x-requested-with': 'XMLHttpRequest'
		});

		if(activeRequest) {
			opts.headers = merge(true,
				activeRequest.headers || {},
				opts.headers,
				{'accept-encoding': ''}
				);
		}

		if (data) {
			opts.form = data;
		}

		return new Promise(function(fulfill, reject) {
			console.log('DATASERVER <- [%s] %s %s', new Date().toUTCString(), opts.method, url);

			request(opts, function(error, res, body) {
				console.log('DATASERVER -> [%s] %s %s %s %dms',
					new Date().toUTCString(), opts.method, url, error || res.statusCode, Date.now() - start);

				if (error || res.statusCode >= 300) {
					return reject(error || res);
				}

				if (res.headers['set-cookie'] && activeRequest) {
					activeRequest.responseHeaders['set-cookie'] = res.headers['set-cookie'];
				}

				fulfill(JSON.parse(body));
			});
		});
	},




	getServiceDocument: function(req) {
		return this._request(null, null, null, req).then(function(json) {
			return new service(json);
		});
	},

	logInPassword: function(url,credentials) {
		var username = credentials ? credentials.username : undefined;
		var password = credentials ? credentials.password : undefined;
		var auth = password ? ('Basic '+btoa(username+':'+password)) : undefined;
		var options = {
			method: 'GET',
			xhrFields: { withCredentials: true },
			headers: {
				Authorization: auth
			}
		};
		return this._request(url,options);
	},

	ping: function(req, username) {
		username = username || (req && req.cookies && req.cookies.username);

		return this._request('logon.ping', null, null, req)//ping
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

				return this._request(urls['logon.handshake'], null, {username: username}, req)
					.then(function(data) {
						var result = {links: merge(true, urls, getLink.asMap(data))};
						if (!getLink(data, 'logon.continue')) {
							result.reason = 'Not authenticated, no continue after handshake.';
							return Promise.reject(result);
						}
						return result;
					});

			}.bind(this));
	}

});


module.exports = DataServerInterface;
