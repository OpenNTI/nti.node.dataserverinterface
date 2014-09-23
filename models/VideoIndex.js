'use strict';

var merge = require('merge');
var withValue = require('../utils/object-attribute-withvalue');


function VideoIndex(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	Object.defineProperty(this, '_order', withValue(data._order || []));
	delete data._order;
	this.data = data;
}

merge(VideoIndex.prototype, {

	asJSON: function() {
		return merge({}, this.data, {_order: this._order});
	},


	map: function(fn) {
		return this._order.map(function(v, i, a) {
			return fn(this.data[v], i, a);
		}.bind(this));
	},


	reduce: function(fn, initial) {
		function reducer(agg, v, i, a) {
			return fn(agg, this.data[v], i, a);
		}
		return this._order.reduce(reducer.bind(this), initial);
	},


	indexOf: function(id) { return this._order.indexOf(id); },


	get: function(id) { return this.data[id]; }
});



function parse(service, data, parent) {
	return new VideoIndex(service, data, parent);
}

VideoIndex.parse = parse.bind(VideoIndex);

module.exports = VideoIndex;
