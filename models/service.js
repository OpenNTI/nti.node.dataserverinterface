'use strict';

var merge = require('merge');

var getLink = require('../utils/getlink');
var deepFreeze = require('../utils/object-deepfreeze');

var ServiceDocument = function (json) {
	deepFreeze(json); //make the data immutable
	merge(this, json);
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
			var items = workspace.Items || [],

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
		if (field) {
			field = '/++fields++' + field;
		}

		return [
			collection.href || '',
			'/',
			encodeURIComponent(ntiid || ''),
			field
		].join('');
	}

});

module.exports = ServiceDocument;
