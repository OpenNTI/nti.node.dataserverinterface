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

	_request: function(link,options,data) {

		var url = Url.parse(this.config.server);
		var start = Date.now();
		var url = url.resolve(link);
		
		var headers = merge( true, {
			'accept': 'application/json',
			'x-requested-with': 'XMLHttpRequest'
		}, (options.headers || {}));

		var opts = {
			url: url,
			method: data ? 'POST' : 'GET',
			headers: headers
		};

		if (data) {
			opts.form = data;
		}

		var opts = merge(true, opts, options);

		return new Promise(function(fulfill, reject) {
			console.log('DATASERVER <- [%s] %s %s', new Date().toUTCString(), opts.method, url);

			request(opts, function(error, res, body) {
				console.log('DATASERVER -> [%s] %s %s %s %dms',
					new Date().toUTCString(), opts.method, url,
					error || res.statusCode, Date.now() - start);

				if (error || res.statusCode >= 300) {
					return reject(error || res);
				}

				if (res.headers['set-cookie']) {
					req.responseHeaders['set-cookie'] = res.headers['set-cookie'];
				}

				fulfill(JSON.parse(body));
			});
		});
	},

	request: function(req, view, data) {
		var url = Url.parse(this.config.server),
				start = Date.now();
		if (view) {
			if (view.charAt(0) === '/') {
				url.pathname = view;
			}
			else {
				url.pathname += view;
			}
		}

		url = url.format();

		var headers = merge(true, (req || {}).headers || {}, {
			'accept': 'application/json',
			//'host': 'localhost:8082',
			'x-requested-with': 'XMLHttpRequest'
		});

		if(req) {
			headers['accept-encoding'] = '';
		}

		var options = {
			url: url,
			method: 'GET',
			headers: headers
		};

		if (data) {
			options.method = 'POST';
			options.form = data;
		}

		return new Promise(function(fulfill, reject) {
			console.log('DATASERVER <- [%s] %s %s', new Date().toUTCString(), options.method, url);

			request(options, function(error, res, body) {
				console.log('DATASERVER -> [%s] %s %s %s %dms',
					new Date().toUTCString(), options.method, url,
					error || res.statusCode, Date.now() - start);

				if (error || res.statusCode >= 300) {
					return reject(error || res);
				}

				if (res.headers['set-cookie']) {
					req.responseHeaders['set-cookie'] = res.headers['set-cookie'];
				}

				fulfill(JSON.parse(body));
			});
		});
	},

	getServiceDocument: function(req) {
		return this.request(req).then(function(json) {
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

		return this.request(req, 'logon.ping')//ping
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

				return this.request(req, urls['logon.handshake'], {username: username})
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
