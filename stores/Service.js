'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var Path = require('path');
var Url = require('url');
var merge = require('merge');

var User = require('../models/User');
var PageInfo = require('../models/PageInfo');
var Capabilities = require('../models/Capabilities');

var DataCache = require('../utils/datacache');

var constants = require('../constants');
var getLink = require('../utils/getlink');
var deepFreeze = require('../utils/object-deepfreeze');
var withValue = require('../utils/object-attribute-withvalue');
var joinWithURL = require('../utils/urljoin');

var ServiceDocument = function (json, server, context) {
	Object.defineProperty(this, '_server', withValue(server));
	Object.defineProperty(this, '_context', withValue(context));
	var caps = json.CapabilityList || [];

	deepFreeze(json); //make the data immutable
	merge(this, json);

	this.capabilities = new Capabilities(this, caps);

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
		return this.getServer()._get(url, this._context);
	},


	head: function(url) {
		return this.get({method: 'HEAD', url: url});
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
		}

		return result.then(function(data) {
			return User.parse(this, data);
		}.bind(this));
	},


	resolveUser: function(username) {
		return this.get(this.getResolveUserURL(username))
			.then(function(data) {
				var user = data.Items.reduce(function(user, data) {
					return user || (data.Username === username && data);
				}, null);
				return user || Promise.reject('Username "'+ username +'" could not resolve.');
			})
			.then(function(user) {
				return User.parse(this, user);
			}.bind(this));
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
			Globals.BULK_USER_RESOLVE_REL);

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
