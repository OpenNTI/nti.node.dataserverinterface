'use strict';

var http = require('http');
var merge = require('merge');
var server = require('../interface');

var SessionManager = function () {};

merge(SessionManager.prototype, {

	getUser: function(req) {

		return this.getServiceDocument(req)
			.then(
				function(doc) {
					var w = doc.getUserWorkspace();
					if (w) {
						return w.Title;
					}
					return Promise.reject('No user workspace');
				});

	},

	getServiceDocument: function(req) {
		return server.ping(req)
			.then(server.getServiceDocument.bind(server, req));
	},




	middleware: function(req, res, next) {
		var start = Date.now();
		var url = req.originalUrl || req.url;


		console.log('SESSION <- [%s] %s %s', new Date().toUTCString(), req.method, url);

		req.responseHeaders = {};

		this.getUser(req).then(function(user) {
			res.set(req.responseHeaders);
			req.username = user;

			console.log('SESSION -> [%s] %s %s (User: %s, %dms)',
				new Date().toUTCString(), req.method, url, user, Date.now() - start);

			next();
		})
		.catch(function(reason) {
			if (!/\/login/.test(req.url)) {
				console.log('SESSION -> [%s] %s %s REDIRECT ./login/ (User: annonymous, %dms)',
					new Date().toUTCString(), req.method, url, Date.now() - start);

				res.redirect('./login/');
			} else {
				console.log('SESSION -> [%s] %s %s (%s, %dms)',
					new Date().toUTCString(), req.method, url, reason, Date.now() - start);
				res.end(reason);
			}
		});
	}

});


module.exports = new SessionManager();
