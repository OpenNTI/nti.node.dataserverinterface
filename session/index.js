'use strict';

var Promise = global.Promise || require('es6-promise').Promise;
var assign = require('object-assign');

var define = require('../utils/object-define-hidden-props');
var Catalog = require('../stores/Catalog');
var Library = require('../stores/Library');
//var Notifications = require('../stores/Notifications');

var SessionManager = function (server) {
	if (!server) {
		throw new Error('No server interface!');
	}
	this.server = server;
	this.config = server.config;
};

assign(SessionManager.prototype, {

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
				define(context,{__nti_service: service});

				return Promise.all([
					service.getAppUser(),
					Catalog.load(service),
					Library.load(service, 'Main')//,
					//Notifications.load(service)
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

				if (reason instanceof Error) {
					return next(reason);
				}

				if (!/\/(api|login)/.test(req.url)) {
					console.log('SESSION -> [%s] %s %s REDIRECT %slogin/ (User: annonymous, %dms)',
						new Date().toUTCString(), req.method, url, basepath, Date.now() - start);

					res.redirect(basepath + 'login/?return=' + encodeURIComponent(req.originalUrl));
				} else {
					console.log('SESSION -> [%s] %s %s (%s, %dms)',
						new Date().toUTCString(), req.method, url, reason, Date.now() - start);

					next(reason);
				}
			});
	},


	anonymousMiddleware: function (context, res, next) {
		this.server.ping(context)
			.then(function() {
				next();
			})
			.catch(function(error) {
				next(error);
			});
	}

});


module.exports = SessionManager;
