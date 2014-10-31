'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

// var Path = require('path');
// var Url = require('url');
var merge = require('merge');

var User = require('../models/User');
var PageInfo = require('../models/PageInfo');
var Capabilities = require('../models/Capabilities');
var Enrollment = require('./Enrollment');

var DataCache = require('../utils/datacache');

var constants = require('../constants');
var getLink = require('../utils/getlink');
var deepFreeze = require('../utils/object-deepfreeze');
var withValue = require('../utils/object-attribute-withvalue');
var joinWithURL = require('../utils/urljoin');

var inflight = {};

var ServiceDocument = function (json, server, context) {
	Object.defineProperty(this, '_server', withValue(server));
	Object.defineProperty(this, '_context', withValue(context));
	var caps = json.CapabilityList || [];

	deepFreeze(json); //make the data immutable
	merge(this, json);

	this.capabilities = new Capabilities(this, caps);
	this.enrollment = new Enrollment(this);

	this.__pending = [
		this.getAppUser().then(function(u) {
			//Ignore this...handwavey magic here.
			this.__$user = u;
			}.bind(this))
	];
};


merge(ServiceDocument.prototype, {

	getServer: function() {
		return this._server;
	},


	getDataCache: function() {
		return DataCache.getForContext(this._context);
	},


	get: function(url) {
		var key = typeof url === 'string' ? url : JSON.stringify(url);

		if (inflight[key]) {
			return inflight[key];
		}

		function clean() {
			delete inflight[key];
		}

		var p = inflight[key] = this.getServer()._get(url, this._context);

		p.then(clean, clean);

		return p;
	},


	head: function(url) {
		return this.get({method: 'HEAD', url: url});
	},


	post: function(url, data) {
		return this.getServer()._post(url, data, this._context);
	},


	hasCookie: function(cookie) {
		var c = this._context;
		var d = global.document;
		c = (c && c.headers) || d;
		c = c && (c.Cookie || c.cookie);
		c = (c && c.split(/;\W*/)) || [];

		function search(found, v) {
			return found || (v && v.indexOf(cookie)===0);
		}

		return c.reduce(search, false);
	},

	getEnrollment: function() {
		return this.enrollment;
	},

	getPageInfo: function(ntiid) {
		var key = 'pageinfo-' + ntiid;
		var cache = this.getDataCache();
		var cached = cache.get(key);
		var result;

		if (cached) {
			result = Promise.resolve(cached);
		} else {
			result = this.getServer().getPageInfo(ntiid, this._context)
				.then(function(json) {
					cache.set(key, json);
					return json;
				});
		}

		return result.then(function(data) {
				return PageInfo.parse(this, data);
			}.bind(this));
	},


	getObjects: function(ntiids) {
		return this.getServer().getObjects(ntiids, this._context);
	},


	getObject: function(ntiid, mime) {
		return this.getServer().getObject(ntiid, mime, this._context);
	},


	getAppUser: function() {
		var key = 'appuser';
		var cache = this.getDataCache();
		var cached = cache.get(key);
		var result;

		if (cached) {
			result = Promise.resolve(cached);
		}
		else {
			result = this.get(this.getResolveAppUserURL())
				.then(function(json) {
					cache.set(key, json);
					return json;
				});
			cache.setVolatile(key, result);//if this is asked for again before we resolve, reuse this promise.
		}

		return result.then(function(data) {
			return User.parse(this, data);
		}.bind(this));
	},


	__requestUserResolve: function(username) {
		var key = 'user-'+username;
		var cache = this.getDataCache();
		var cached = cache.get(key);
		var result;

		if (cached) {
			result = Promise.resolve(cached);
		}
		else {
			result = this.get(this.getResolveUserURL(username))
				.then(function(data) {
					var user = data.Items.reduce(function(user, data) {
						return user || (data.Username === username && data);
					}, null);

					cache.set(key, user);
					return user || Promise.reject('Username "'+ username +'" could not resolve.');
				});
			cache.setVolatile(key, result);//if this is asked for again before we resolve, reuse this promise.
		}

		return result.then(function(data) {
			return User.parse(this, data);
		}.bind(this));
	},


	resolveUser: function(username) {
		var key = 'user-respository';
		var cache = this.getDataCache();
		var repo = cache.get(key) || {};
		cache.setVolatile(key, repo);

		if (repo[username]) {
			return Promise.resolve(repo[username]);
		}

		var req = repo[username] = this.__requestUserResolve(username);

		req.then(
			function(user){
				repo[username] = user;
			},
			function() {
				delete repo[username];
			});

		return req;
	},

	getUserWorkspace: function() {
		var workspace;
		this.Items.every(function(o) {
			if (getLink(o, 'ResolveSelf')) {
				workspace = o;
			}
			return !workspace;
		});

		return workspace;
	},


	getWorkspace: function(name) {
		var workspace;
		this.Items.every(function(o) {
			if (o.Title === name) {
				workspace = o;
			}
			return !workspace;
		});

		return workspace;
	},


	getCollection: function(title, workspaceName) {
		var workspace = workspaceName ?
					this.getWorkspace(workspaceName) :
					this.getUserWorkspace(),
			items = (workspace && workspace.Items) || [],
			collection = null;

		items.every(function(o) {
			if (o.Title === title) {
				collection = o;
			}
			return !collection;
		});

		return collection;
	},


	ensureAnalyticsSession: function () {
		var workspace = this.getWorkspace('Analytics');
		var url = getLink(workspace, 'analytics_session');

		return this.hasCookie('nti.da_session') ? Promise.resolve() : this.post(url);
	},


	postAnalytics: function(events) {
		var workspace = this.getWorkspace('Analytics');
		var url = getLink(workspace, 'batch_events');
		var payload = {
			MimeType: 'application/vnd.nextthought.analytics.batchevents',
			events: events
		};

		return this.ensureAnalyticsSession()
				.then(this.post.bind(this, url, payload));
	},


	/**
	 *
	 * @param {String} mimeType
	 * @param {String} [title]
	 */
	getCollectionFor: function(mimeType, title) {
		var result = null,
			items = this.Items || [];

		items.every(function(workspace) {
			var items = workspace.Items || [];

			items.every(function(collection) {
				if (collection.accepts.indexOf(mimeType) > -1) {
					if (!title || collection.Title === title) {
						result = collection;
					}
				}

				return !result;
			});

			return !result;
		});

		return result;
	},


	getContainerURL: function(ntiid) {
		var base = this.getResolveAppUserURL();
		var pageURI = encodeURIComponent('Pages('+ntiid+')');

		return joinWithURL(base, pageURI);
	},


	getContentPackagesURL: function(name) {
		return (this.getCollection(name || 'Main', 'Library') || {}).href;
	},


	getContentBundlesURL: function () {
		return (this.getCollection('VisibleContentBundles', 'ContentBundles') || {}).href;
	},


	getCoursesEnrolledURL: function() {
		return (this.getCollection('EnrolledCourses', 'Courses') || {}).href;
	},


	getCoursesAdministeringURL: function() {
		return (this.getCollection('AdministeredCourses', 'Courses') || {}).href;
	},


	getCoursesCatalogURL: function() {
		return (this.getCollection('AllCourses', 'Courses') || {}).href;
	},


	getObjectURL: function(ntiid, field) {
		var collection = this.getCollection('Objects', 'Global') || {};
		var parts = [
			collection.href || '',
			encodeURIComponent(ntiid || '')
		];
		if (field) {
			parts.push('++fields++' + field);
		}

		return parts.join('/');
	},


	getUserSearchURL: function(username) {
		var l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			constants.REL_USER_SEARCH);

		if (!l) {
			return null;
		}

		return joinWithURL(l, username && encodeURIComponent(username));
	},


	getUserUnifiedSearchURL: function() {
		var l = getLink(
			(this.getUserWorkspace() || {}).Links || [],
			constants.REL_USER_UNIFIED_SEARCH);

		return l || null;
	},


	getResolveAppUserURL: function() {
		return getLink(this.getUserWorkspace(), 'ResolveSelf');
	},


	getResolveUserURL: function(username) {
		var l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			constants.REL_USER_RESOLVE);

		if (!l) {
			return null;
		}

		return joinWithURL(l, username && encodeURIComponent(username));
	},


	getBulkResolveUserURL: function() {
		var l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			constants.REL_BULK_USER_RESOLVE);

		return l || null;
	},


	getPurchasableItemURL: function() {
		return '/dataserver2/store/get_purchasables';//TODO: this is legacy...replace
	},


	getStoreActivationURL: function() {
		return '/dataserver2/store/redeem_purchase_code';//TODO: this is legacy...replace
	},

});

module.exports = ServiceDocument;
