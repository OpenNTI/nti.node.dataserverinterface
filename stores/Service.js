'use strict';

import {parse} from '../models/Parser';

import Capabilities from '../models/Capabilities';

import Enrollment from './Enrollment';
import Forums from './Forums';

import DataCache from '../utils/datacache';

import {REL_USER_SEARCH, REL_USER_UNIFIED_SEARCH, REL_USER_RESOLVE, REL_BULK_USER_RESOLVE} from '../constants';
import getLink from '../utils/getlink';
import joinWithURL from '../utils/urljoin';
import {isNTIID} from '../utils/ntiids';

const inflight = {};

const Server = Symbol.for('Server');
const Service = Symbol.for('Service');
const Context = Symbol.for('Context');
const Pending = Symbol.for('PendingRequests');
const AppUser = Symbol('LoggedInUser');

export default class ServiceDocument {
	constructor (json, server, context) {
		this[Service] = this; //So the parser can access it
		this[Server] = server;
		this[Context] = context;

		var caps = json.CapabilityList || [];

		Object.assign(this, json);

		this.capabilities = new Capabilities(this, caps);
		this.enrollment = new Enrollment(this);
		this.forums = new Forums(this);

		this[Pending] = [
			this.getAppUser().then(u =>
				this[AppUser] = u
			)
		];
	}


	getServer () {
		return this[Server];
	}


	getDataCache () {
		return DataCache.getForContext(this[Context]);
	}


	get (url) {
		var key = typeof url === 'string' ? url : JSON.stringify(url);

		if (inflight[key]) {
			return inflight[key];
		}

		function clean() {
			delete inflight[key];
		}

		var p = inflight[key] = this.getServer()._get(url, this[Context]);

		p.then(clean, clean);

		return p;
	}


	head (url) {
		return this.get({method: 'HEAD', url: url});
	}


	post (url, data) {
		return this.getServer()._post(url, data, this[Context]);
	}


	put (url, data) {
		return this.getServer()._put(url, data, this[Context]);
	}


	delete (url, data) {
		return this.getServer()._delete(url, data, this[Context]);
	}


	hasCookie (cookie) {
		var c = this[Context];
		var d = global.document;
		c = (c && c.headers) || d;
		c = c && (c.Cookie || c.cookie);
		c = (c && c.split(/;\W*/)) || [];

		function search(found, v) {
			return found || (v && v.indexOf(cookie)===0);
		}

		return c.reduce(search, false);
	}


	getEnrollment () {
		return this.enrollment;
	}


	getPageInfo (ntiid) {
		var key = 'pageinfo-' + ntiid;
		var cache = this.getDataCache();
		var cached = cache.get(key);
		var result;

		if (cached) {
			result = Promise.resolve(cached);
		} else {
			result = this.getServer().getPageInfo(ntiid, this[Context])
				.then(function(json) {
					cache.set(key, json);
					return json;
				});
		}

		return result.then(info=>parse(this[Service], this, info));
	}


	getObjects (ntiids) {
		return this.getServer().getObjects(ntiids, this[Context]);
	}


	getObject (ntiid, mime) {
		return this.getServer().getObject(ntiid, mime, this[Context]);
	}


	getAppUsername  () {
		var w = this.getUserWorkspace();
		return w && w.Title;
	}


	getAppUser () {
		var key = 'appuser';
		var cache = this.getDataCache();
		var cached = cache.get(key);
		var result;
		var url;

		if (cached) {
			result = Promise.resolve(cached);
		}
		else {
			url = this.getResolveAppUserURL();
			if (url) {
				result = this.get(url)
					.then(function(json) {
						cache.set(key, json);
						return json;
					});

				cache.setVolatile(key, result);//if this is asked for again before we resolve, reuse this promise.

			} else {
				result = Promise.resolve(null);
			}
		}

		return result.then(user=>parse(this[Service], this, user));
	}


	/**
	 * Do not use this method for general purpose resolving the user,
	 * use the async method.
	 */
	getAppUserSync () {
		return this[AppUser] ||
			(()=>{throw new Error('User is not resolved');}());
	}


	__requestUserResolve (username) {
		var key = 'user-'+username;
		var cache = this.getDataCache();
		var cached = cache.get(key);
		var result;

		if (cached) {
			result = Promise.resolve(cached);
		}
		else {
			result = this.get(this.getResolveUserURL(username))
				.then(data => {
					var items = data.Items || [data];
					var user = items.reduce((user, data) =>
						user || (data.Username === username && data), null);

					cache.set(key, user);
					return user || Promise.reject('Username "'+ username +'" could not resolve.');
				});

			cache.setVolatile(key, result);//if this is asked for again before we resolve, reuse this promise.
		}

		return result.then(user => parse(this[Service], this, user));
	}


	resolveUser (username) {
		var key = 'user-respository';
		var cache = this.getDataCache();
		var repo = cache.get(key) || {};
		cache.setVolatile(key, repo);

		if (repo[username]) {
			return Promise.resolve(repo[username]);
		}

		var req = repo[username] = this.__requestUserResolve(username);

		req.then(
			user=> repo[username] = user,
			()=> delete repo[username]);

		return req;
	}


	getUserWorkspace () {
		var workspace;
		this.Items.every(function(o) {
			if (getLink(o, 'ResolveSelf')) {
				workspace = o;
			}
			return !workspace;
		});

		return workspace;
	}


	getWorkspace (name) {
		var workspace;
		this.Items.every(function(o) {
			if (o.Title === name) {
				workspace = o;
			}
			return !workspace;
		});

		return workspace;
	}


	getCollection (title, workspaceName) {
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
	}


	ensureAnalyticsSession  () {
		var workspace = this.getWorkspace('Analytics');
		var url = getLink(workspace, 'analytics_session');

		return this.hasCookie('nti.da_session') ? Promise.resolve() : this.post(url);
	}


	postAnalytics (events) {
		var workspace = this.getWorkspace('Analytics');
		var url = getLink(workspace, 'batch_events');
		var payload = {
			MimeType: 'application/vnd.nextthought.analytics.batchevents',
			events: events
		};

		return this.ensureAnalyticsSession()
				.then(this.post.bind(this, url, payload));
	}


	/**
	 *
	 * @param {String} mimeType
	 * @param {String} [title]
	 */
	getCollectionFor (mimeType, title) {
		var result = null,
			items = this.Items || [];

		if (mimeType && typeof mimeType !== 'string') {
			mimeType = mimeType.MimeType;
		}

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
	}


	getContainerURL (ntiid) {
		var base = this.getResolveAppUserURL();
		var pageURI = encodeURIComponent('Pages('+ntiid+')');

		return joinWithURL(base, pageURI);
	}


	getContentPackagesURL (name) {
		return (this.getCollection(name || 'Main', 'Library') || {}).href;
	}


	getContentBundlesURL  () {
		return (this.getCollection('VisibleContentBundles', 'ContentBundles') || {}).href;
	}


	getCoursesEnrolledURL () {
		return (this.getCollection('EnrolledCourses', 'Courses') || {}).href;
	}


	getCoursesAdministeringURL () {
		return (this.getCollection('AdministeredCourses', 'Courses') || {}).href;
	}


	getCoursesCatalogURL () {
		return (this.getCollection('AllCourses', 'Courses') || {}).href;
	}


	getObjectURL (ntiid, field) {
		var collection = this.getCollection('Objects', 'Global') || {};
		var parts = [
			collection.href || '',
			encodeURIComponent(ntiid || '')
		];
		if (field) {
			parts.push('++fields++' + field);
		}

		return parts.join('/');
	}


	getUserSearchURL (username) {
		var l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			REL_USER_SEARCH);

		if (!l) {
			return null;
		}

		return joinWithURL(l, username && encodeURIComponent(username));
	}


	getUserUnifiedSearchURL () {
		var l = getLink(
			(this.getUserWorkspace() || {}).Links || [],
			REL_USER_UNIFIED_SEARCH);

		return l || null;
	}


	getResolveAppUserURL () {
		return getLink(this.getUserWorkspace(), 'ResolveSelf');
	}


	getResolveUserURL (username) {
		if (isNTIID(username)) {
			return this.getObjectURL(username);
		}

		var l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			REL_USER_RESOLVE);

		if (!l) {
			return null;
		}

		return joinWithURL(l, username && encodeURIComponent(username));
	}


	getBulkResolveUserURL () {
		var l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			REL_BULK_USER_RESOLVE);

		return l || null;
	}


	getPurchasableItemURL () {
		return '/dataserver2/store/get_purchasables';//TODO: this is legacy...replace
	}


	getStoreActivationURL () {
		return '/dataserver2/store/redeem_purchase_code';//TODO: this is legacy...replace
	}

}
