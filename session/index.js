'use strict';

var Promise = global.Promise || require('es6-promise').Promise;
var merge = require('merge');

var Library = require('../stores/Library');
var Notifications = require('../stores/Notifications');

var SessionManager = function (server) {
	if (!server) {
		throw new Error('No server interface!');
	}
	this.server = server;
	this.config = server.config;
};

merge(SessionManager.prototype, {

	getUser: function(context) {

		return this.getServiceDocument(context)
			.then(function(doc) {
					var w = doc.getUserWorkspace();
					if (w) {
						return w.Title;
					}
					return Promise.reject('No user workspace');
				});

	},

	getServiceDocument: function(context) {
		var server = this.server;
		return server.ping(context)
			.then(server.getServiceDocument.bind(server, context));
	},



	setupIntitalData: function(context) {
		return this.server.getServiceDocument(context)
			.then(function(service) {

				return Promise.all([
					Library.load(service, 'Main'),
					Notifications.load(service)
				]);

			});
	},



	middleware: function(req, res, next) {
		var start = Date.now();
		var url = req.originalUrl || req.url;
		var basepath = this.config.basepath || '/';

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
				if ((reason || {}).___isResponse) {
					reason = reason.statusCode;
				}

				console.error('CATCH: ', reason);
				if (!/\/login/.test(req.url)) {
					console.log('SESSION -> [%s] %s %s REDIRECT %slogin/ (User: annonymous, %dms)',
						new Date().toUTCString(), req.method, url, basepath, Date.now() - start);

					res.redirect(basepath + 'login/');
				} else {
					console.log('SESSION -> [%s] %s %s (%s, %dms)',
						new Date().toUTCString(), req.method, url, reason, Date.now() - start);
					res.end(reason);
				}
			});
	}

});


module.exports = SessionManager;
