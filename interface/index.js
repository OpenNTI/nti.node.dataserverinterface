'use strict';

var Url = require('url');
var request = require('request');
var merge = require('merge');

var config = require('../../common.js').config();
var getLink = require('../utils/getlink.js');
var clean = require('../utils/object-clean.js');

var service = require('../models/service.js');

var DataServerInterface = function () {};

merge(DataServerInterface.prototype, {

	request: function(req, view, data) {
		var url = Url.parse(config.server),
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

		var options = {
			url: url,
			method: 'GET',
			headers: merge(true, req.headers, {
				'accept': 'application/json',
				'accept-encoding': '',
				//'host': 'localhost:8082',
				'x-requested-with': 'XMLHttpRequest'
			})
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


	ping: function(req) {
		var username = req.cookies.username;

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
				return this.request(req, urls['logon.handshake'], {username: username})
					.then(function(data) {
						if (!getLink(data, 'logon.continue')) {
							return Promise.reject('Not authenticated, no continue after handshake.');
						}

						return merge(true, urls, getLink.asMap(data));
					});

			}.bind(this));
	}


});


module.exports = new DataServerInterface();
