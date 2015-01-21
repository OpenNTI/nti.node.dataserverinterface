'use strict';

var EventEmitter = require('events').EventEmitter;
var getLink = require('../../utils/getlink');
var isFunction = require('../../utils/isfunction');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var parse = require('../../utils/parse-object');

var CONTENT_VISIBILITY_MAP = {
	OU: 'OUID'
};

function dateGetter(key) {
	return function () {
		if (typeof this[key] !== 'object') {
			this.__parseDate(key);
		}
		return this[key];
	};
}


Object.assign(exports, {

	getCreatedTime: dateGetter('CreatedTime'),

	getLastModified: dateGetter('Last Modified'),


	getData: function() {
		var k, v, d = {};

		for (k in this) {
			if (!this.hasOwnProperty(k)) {continue;}
			v = this[k];
			if (v !== void undefined && !isFunction(v)) {

				if (v && isFunction(v.getData)) {
					v = v.getData();
				}

				d[k] = v;
			}
		}

		return d;
	},


	refresh () {
		return this._service.getObject(this.getID())
			.then(o => {
				if (this.NTIID !== o.NTIID) {
					throw new Error('Mismatch!');
				}

				for(let prop in o) {
					if (o.hasOwnProperty(prop)) {

						let current = this[prop];
						let value = o[prop];
						if (current && current._service) {
							value = parse(this, value);
						}

						if (typeof current === 'function') {
							throw new Error('a value was named as one of the methods on this model.');
						}

						this[prop] = value;

					}
				}

				return this;
			});

	},


	getID: function() {
		return this.NTIID;
	},


	getLink: function(rel) {
		return getLink(this, rel);
	},


	getLinkMap: function() {
		return getLink.asMap(this);
	},


	hasLink: function (rel) {
		return rel in getLink.asMap(this);
	},


	onChange: function(who) {
		this.emit('changed', this, who);
	},


	/**
	 * Returns the first parent that matches the given query. If no query is given, the immediate parent is returned.
	 *
	 * If only one argument is given, it will look for the first parent that has that attribute (ignoring value)
	 * If two argumetns are given, then it will look for the first parent that has that attribute and matches the
	 * attibuteValue test.
	 *
	 * @param  {String} attribute
	 * @param  {String|RegExp} [attributeValue]
	 *
	 * @return {Model}
	 */
	up: function(...query) {
		var p = this._parent;

		if (p && (query.length === 0 || p._is(...query))) {
			return p;
		}

		return p && p.up(...query);
	},


	/**
	 * Returns a list of parents that match the given query. If no query is given, all parents are returned.
	 *
	 * @see #up()
	 *
	 * @param  {String} attribute
	 * @param  {String|RegExp} [attributeValue]
	 *
	 * @return {Model[]}
	 */
	parents: function(...query) {
		var matches = [];
		var p = this._parent;

		if (p && p.parents) {

			matches = p.parents(...query);
			if (query.length === 0 || p._is(...query)) {
				matches.push(p);
			}
		}

		return matches;
	},


	_is: function(attributeQuery, attributeQueryValue) {
		if (attributeQueryValue === undefined) {
			return this[attributeQuery] !== undefined;
		}

		if (attributeQueryValue && attributeQueryValue.test) {
			return attributeQueryValue.test(this[attributeQuery]);
		}

		return this[attributeQuery] === attributeQueryValue;
	},


	hasVisibility: function(el, status) {
		function getProp(p) {
			var fn = ['getAttribute', 'get']
				.reduce(function(f, n) { return f || el[n] && n; }, 0);
			return (fn && el[fn](p)) || el[p];
		}


		var u = this._service.__$user || {},//pretend you did not read this line.
			visibilityKey = getProp('visibility'),
			attr = CONTENT_VISIBILITY_MAP[visibilityKey] || visibilityKey;

		// NOTE: Some pieces of content within a course may have limited access (mainly on Copyright issues).
		// i.e only be available for OU students.
		// If the appUser doesn't have the visibility key or whatever it maps to,
		// then we conclude that they shouldn't have access to that content.
		// Right now, there is no great way to determine what that visibility key is or maps to.

		// For the short-term, since the request is for OU students and all 4-4 users(OU)
		// have a 'OUID' on the user record, we will check for its existence.
		// TODO: we need to define what this 'visibility' means for an AppUser in general (rather than just OU) or
		// have a convention on how have we resolve it.
		return !attr || u.hasOwnProperty(attr) || attr === status || (/everyone/i).test(attr);
	},





	__parseDate: function(key) {
		var me = this;
		var v = me[key];
		if (!v) {
			return;
		}

		if (typeof v === 'number') {
			v = Math.floor(v * 1000);
		}

		var d = new Date(v);
		//if not equal to the input...
		//toISOString includes millies, drop the millies
		if (typeof v === 'string' && d.toISOString().replace(/\.\d+/,'') !== v) {
			throw new Error('Bad Date String Parse: '+ v);
		}
		else if (typeof v === 'number' && d.getTime() !== v) {
			throw new Error('Bad Date Stamp Parse');
		}

		me[key] = d;
	},


	__reParent: function(newParent) {
		delete this._parent;
		define(this,{
			_parent: withValue(newParent)
		});
	}

}, EventEmitter.prototype);
