'use strict';

var assign = require('../../utils/assign');
var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var fixRefs = require('../../utils/rebase-references');

assign(exports, {

	getContentRoot: function () {
		return this.ContentRoot || this.up('getContentRoot').getContentRoot();
	}
});


define(exports, {
	initMixin: withValue(
		function initContentMixin(data) {
			var content = data.content;

			delete data.content;

			define(this,{
				content: {
					enumerable: true,
					configurable: true,
					get: function __getContent () {
						try {
							var root = this.getContentRoot();
							content = fixRefs(content, root);
						} catch (e) {
							console.error('Content cannot be rooted. %s', e.stack || e.message || e);
						}
						//re-define the getter
						define(this, {content: withValue(content, true)});
						return content;
					}.bind(this)
				}
			});
		}
	)
});
