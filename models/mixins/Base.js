'use strict';

var EventEmitter = require('events').EventEmitter;
var merge = require('merge');
var getLink = require('../../utils/getlink');
var isBrowser = require('../../utils/browser');
var urlJoin = require('../../utils/urljoin');
var isEmpty = require('../../utils/isempty');



merge(exports, {

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
	}
}, EventEmitter.prototype);
