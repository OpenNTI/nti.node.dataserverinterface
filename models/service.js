'use strict';

var Path = require('path');
var Url = require('url');
var merge = require('merge');

var Capabilities = require('./capabilities');

var constants = require('../constants');
var getLink = require('../utils/getlink');
var deepFreeze = require('../utils/object-deepfreeze');
var joinWithURL = require('../utils/urljoin');

var ServiceDocument = function (json) {
	deepFreeze(json); //make the data immutable
	merge(this, json);
	this.capabilities = new Capabilities(this.CapabilityList || []);
	console.log(this.capabilities);
};


merge(ServiceDocument.prototype, {

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


	getLibrary: function(name) {
		var libs = this.getWorkspace('Library') || {},
			items = libs.Items || [],
			library = null;

		items.every(function(o) {
			if (o.Title === name) {
				library = o;
			}
			return !library;
		});

		return library;
	},


	getMainLibrary: function() {
		return this.getLibrary('Main') || {};
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
				if (item.accepts.indexOf(mimeType) > -1) {
					if (!title || item.Title === title) {
						result = item;
					}
				}

				return !result;
			});

			return !result;
		});

		return result;
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


	getResolveUserURL: function(username) {
		var l = this.getLinkFrom(
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
