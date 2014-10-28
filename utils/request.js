/* global SERVER, ActiveXObject, XMLHttpRequest */
'use strict';

var XMLHttpFactories = [
	function() {return new XMLHttpRequest();},
	function() {return new ActiveXObject('Msxml2.XMLHTTP');},
	function() {return new ActiveXObject('Msxml3.XMLHTTP');},
	function() {return new ActiveXObject('Microsoft.XMLHTTP');}
];


function createXMLHTTPObject() {
	var i = 0;
	for (i; i < XMLHttpFactories.length; i++) {
		try { return XMLHttpFactories[i](); }
		catch (e) { }
	}
	return null;
}


function copy(dest, src, keys) {
	(keys || []).forEach(function(key) {
		if (src[key]) {
			dest[key] = src[key];
		}
	});
}

function keysToLowerCase(o) {
	var k, out = {};
	for (k in o) {
		if (o.hasOwnProperty(k)) {
			out[k.toLowerCase()] = o[k];
		}
	}
	return out;
}


module.exports = exports = SERVER ? //SERVER is declared in th WebPack config file
	//in node.js land...
	require('request') :

	//Mimic request() node package in the browser...
	function (options, callback) {
		try {
			var headers,
				headersNormalized = keysToLowerCase(options.headers || {}),
				formType, defaultType = 'application/x-www-form-urlencoded',
				req = createXMLHTTPObject();

			if (!req) {
				return callback('No XHR');
			}


			if (typeof options === 'string') {
				options = {
					url: options
				};
			}

			options.method = options.method || (options.form ? 'POST' : 'GET');


			req.open(options.method, options.url, true);
			formType = headersNormalized['content-type'];

			if (options.form && (!formType || formType === defaultType)) {
				req.setRequestHeader('Content-type', defaultType);
				if (typeof options.form === 'object') {
					options.form = Object.keys(options.form).reduce(function(str, v) {
						var joiner = str.length === 0 || str[str.length - 1] === '&' ? '' : '&';
						return str + joiner + encodeURIComponent(v) + '=' + encodeURIComponent(options.form[v]);
					}, '');
				}
			}
			else if (typeof options.form === 'object') {
				options.form = JSON.stringify(options.form);
			}

			headers = options.headers;
			if (headers) {
				Object.keys(headers).forEach(function(key) {
					req.setRequestHeader(key, headers[key]);
				});
			}


			req.onreadystatechange = function() {
				if (req.readyState !== 4 || !callback) {
					return;
				}

				try {
					/* jslint -W101 */
					// see: https://prototype.lighthouseapp.com/projects/8886/tickets/129-ie-mangles-http-response-status-code-204-to-1223
					var status = req.status === 1223 ? 204 : req.status;
					var headers = req.getAllResponseHeaders()
									.trim()
									.split('\n')
									.map(function(i) {
										return i.split(':')[0];
									});

					var response = {
						statusCode: status,
						headers: {}
					};

					copy(response, req, [
						'response',
						'responseText',
						'responseType',
						'responseURL',
						'responseXML',
						'status',
						'statusText'
					]);

					headers.forEach(function(i) {
						response.headers[i] = req.getResponseHeader(i); });

					try {
						callback(false, response, req.responseText);
					} catch(badCallback) {
						console.error('Yo, your call back sucks: %o', badCallback);
					}
					callback = null;

				} catch(asyncErr) {
					callback(asyncErr, null, asyncErr.message);
				}
			};

			if (req.readyState === 4) {
				req.onreadystatechange();
				return;
			}

			req.send(options.form);
		} catch(e) {
			callback(e, null, e.message);
		}
	};
