import Catalog from '../stores/Catalog';
import Library from '../stores/Library';
import logger from '../logger';
// import Notifications from '../stores/Notifications';

import {ServiceStash} from '../CommonSymbols';

export default class SessionManager {
	constructor (server) {
		if (!server) {
			throw new Error('No server interface!');
		}
		this.server = server;
		this.config = server.config;
	}


	getUser (context) {

		return this.getServiceDocument(context)
			.then(doc => {
					var w = doc.getUserWorkspace();
					if (w) {
						return w.Title;
					}
					return Promise.reject('No user workspace');
				});

	}


	getServiceDocument (context) {
		var server = this.server;
		return server.ping(context)
			.then(server.getServiceDocument.bind(server, context));
	}


	setupIntitalData (context) {
		return this.server.getServiceDocument(context)
			.then(service => {
				context[ServiceStash] = service;

				return Promise.all([
					service.getAppUser(),
					Catalog.load(service),
					Library.load(service, 'Main')//,
					//Notifications.load(service)
				]);

			});
	}


	middleware (req, res, next) {
		var start = Date.now();
		var url = req.originalUrl || req.url;
		var basepath = this.config.basepath || '/';

		req.responseHeaders = {};


		logger.debug('SESSION <- [%s] %s %s', new Date().toUTCString(), req.method, url);

		function finish() {
			res.set(req.responseHeaders);
			logger.debug('SESSION -> [%s] %s %s (User: %s, %dms)',
				new Date().toUTCString(), req.method, url, req.username, Date.now() - start);
			next();
		}

		this.getUser(req)
			.then(user => req.username = user)
			.then(this.setupIntitalData.bind(this, req))
			.then(finish)
			.catch(reason => {
				if ((reason || {}).hasOwnProperty('statusCode')) {
					reason = reason.statusCode;
				}

				if (reason instanceof Error) {
					return next(reason);
				}

				if (!/\/(api|login)/.test(req.url)) {
					logger.debug('SESSION -> [%s] %s %s REDIRECT %slogin/ (User: annonymous, %dms)',
						new Date().toUTCString(), req.method, url, basepath, Date.now() - start);

					res.redirect(basepath + 'login/?return=' + encodeURIComponent(req.originalUrl));
				} else {
					logger.debug('SESSION -> [%s] %s %s (%s, %dms)',
						new Date().toUTCString(), req.method, url, reason, Date.now() - start);

					next(reason);
				}
			});
	}


	anonymousMiddleware (context, res, next) {
		this.server.ping(context)
			.then(() => next())
			.catch(err => {
				if (typeof err === 'string' || (err && err.reason)) {
					next();
				} else {
					next(err);
				}
			});
	}

}
