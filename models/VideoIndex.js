'use strict';

var merge = require('merge');
var defineProperties = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');

var Video = require('./Video');

function VideoIndex(service, parent, data) {
	defineProperties(this, {
		_service: withValue(service),
		_parent: withValue(parent),
		_order: withValue(data._order || [])
	});

	delete data._order;

	this.data = {};

	for(var index in data) {
		this.data[index] = Video.parse(service, parent, data[index]);
	}
}

merge(VideoIndex.prototype, {

	asJSON: function() {
		return merge({}, this.data, {_order: this._order});
	},


	filter: function(fn) {
		var data = {};
		var order = this._order.filter(function(v, i, a) {
			var o = this.data[v];
			var pass = fn(o, i, a);
			if (pass) {
				data[v] = o;
			}
			return pass;
		}.bind(this));

		data._order = order;

		return new VideoIndex(this._service, data, this._parent);
	},


	map: function(fn) {
		return this._order.map(function(v, i, a) {
			return fn(this.data[v], i, a);
		}.bind(this));
	},


	reduce: function(fn, initial) {
		var data = this.data;

		function reducer(agg, v, i, a) {
			return fn(agg, data[v], i, a);
		}

		return this._order.reduce(reducer, initial);
	},


	indexOf: function(id) { return this._order.indexOf(id); },


	get: function(id) { return this.data[id]; }
});



function parse(service, parent, data) {
	return new VideoIndex(service, parent, data);
}

VideoIndex.parse = parse.bind(VideoIndex);

module.exports = VideoIndex;
