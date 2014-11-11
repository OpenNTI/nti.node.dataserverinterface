'use strict';

var assign = require('object-assign');
var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var fixRefs = require('../../utils/rebase-references');
var clean = require('../../utils/sanitize-markup');

assign(exports, {

	getContentRoot: function () {
		return this.ContentRoot || this.up('getContentRoot').getContentRoot();
	}
});


define(exports, {
	initMixin: withValue(
		function initContentMixin(data) {
			var content = data.content;
			if (!content) {return;}
			
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

						content = clean(content);

						//re-define the getter
						define(this, {content: withValue(content, true)});
						return content;
					}.bind(this)
				}
			});
		}
	)
});
