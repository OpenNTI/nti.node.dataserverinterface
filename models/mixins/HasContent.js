'use strict';

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var fixRefs = require('../../utils/rebase-references');
var clean = require('../../utils/sanitize-markup');

Object.assign(exports, {

	getContentRoot: function () {
		return this.ContentRoot || this.up('getContentRoot').getContentRoot();
	}
});


define(exports, {
	initMixin: withValue(
		function (data, keys) {
			var props = {};
			var clean = exports.cleanupContentString.bind(this);
			if (keys === undefined) {
				keys = ['content'];
			}


			for(let key of keys) {
				let content = data[key] || '';
				props[key] = {
					enumerable: true,
					configurable: true,
					/*jshint -W083*/
					get: function () {

						if (Array.isArray(content)) {
							content = content.map(clean);
						} else {
							content = clean(content);
						}

						//re-define the getter
						var newValue = {};
						newValue[key] = withValue(content, true);

						define(this, newValue);
						return content;
					}
					/*jshint +W083*/
				};
			}

			define(this, props);
		}
	),

	cleanupContentString: withValue(
		function (content) {
			try {
				var root = this.getContentRoot();
				content = fixRefs(content, root);
			} catch (e) {
				console.error('Content cannot be rooted. %s', e.stack || e.message || e);
			}

			return clean(content);
		}
	)
});
