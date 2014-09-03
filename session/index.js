'use strict';

var Promise = global.Promise || require('es6-promise').Promise;
var merge = require('merge');

var Library = require('../models/Library');

var SessionManager = function (server) {
	if (!server) {
		throw new Error('No server interface!');
	}
	this.server = server;
};

merge(SessionManager.prototype, {

	getUser: function(req) {

		return this.getServiceDocument(req)
			.then(function(doc) {
					var w = doc.getUserWorkspace();
					if (w) {
						return w.Title;
					}
					return Promise.reject('No user workspace');
				});

	},

	getServiceDocument: function(req) {
		var server = this.server;
		return server.ping(req)
			.then(server.getServiceDocument.bind(server, req));
	},



	setupIntitalData: function(req) {
		return this.server.getServiceDocument(req)
			.then(function(service) {

				return Promise.all([

					Library.load(service, 'Main', req)
				]);

			});
	},



	middleware: function(req, res, next) {
		var start = Date.now();
		var url = req.originalUrl || req.url;

		req.responseHeaders = {};

		console.log('SESSION <- [%s] %s %s', new Date().toUTCString(), req.method, url);

		function finish() {
			res.set(req.responseHeaders);
			console.log('SESSION -> [%s] %s %s (User: %s, %dms)',
				new Date().toUTCString(), req.method, url, req.username, Date.now() - start);
			next();
		}

		this.getUser(req)
			.then(function(user) { req.username = user; })
			.then(this.setupIntitalData.bind(this, req))
			.then(finish)
			.catch(function(reason) {
				console.error('CATCH: ', reason);
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


module.exports = SessionManager;
