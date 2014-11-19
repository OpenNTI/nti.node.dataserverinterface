'use strict';

var EventEmitter = require('events').EventEmitter;
var getLink = require('../../utils/getlink');
var isFunction = require('../../utils/isfunction');


var CONTENT_VISIBILITY_MAP = {
	OU: 'OUID'
};

Object.assign(exports, {


	getData: function() {
		var k, v, d = {};

		for (k in this) {
			if (!this.hasOwnProperty(k)) {continue;}
			v = this[k];
			if (v && !isFunction(v)) {

				if (v && isFunction(v.getData)) {
					v = v.getData();
				}

				d[k] = v;
			}
		}

		return d;
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


	onChange: function(who) {
		this.emit('changed', this, who);
	},


	up: function(query) {
		var p = this._parent;

		if (p && p._is(query)) {
			return p;
		}

		return p && p.up(query);
	},


	_is: function(attibuteQuery) {
		return !!this[attibuteQuery];
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
	}

}, EventEmitter.prototype);
