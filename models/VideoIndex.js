import Video from './Video';
import PageSourceModel from './VideoIndexBackedPageSource';
import {Service, Parent} from '../CommonSymbols';

const PageSource = Symbol('PageSource');
const Order = Symbol('Order');
const Data = Symbol('Data');

export default class VideoIndex {
	static parse (service, parent, data, order) {
		console.error('Where ?');
		return new this(service, parent, data, order);
	}

	constructor (service, parent, data, order) {

		this[Service] = service;
		this[Parent] = parent;
		this[Order] = order || data[Order] || [];
		this[Data] = {};

		delete data[Order];
		delete data._order;

		for(var key in data) {
			if (data.hasOwnProperty(key)) {
				this[Data][key] = new Video(service, this, data[key]);
			}
		}
	}


	get length () { return this[Order].length; }


	asJSON () {
		console.log('Still used?');
		return Object.assign({}, this[Data]);
	}


	combine (that) {
		var order = this[Order].concat(that[Order]);
		var data = Object.assign({}, this[Data], that[Data]);

		return new this.constructor(this[Service], this[Parent], data, order);
	}


	filter (fn) {
		var data = {};
		var order = this[Order].filter((v, i, a) => {
			var o = this[Data][v];
			var pass = fn(o, i, a);
			if (pass) {
				data[v] = o;
			}
			return pass;
		});

		data[Order] = order;

		return new this.constructor(this[Service], this[Parent], data);
	}


	map (fn) {
		return this[Order].map((v, i, a) =>fn(this[Data][v], i, a));
	}


	reduce (fn, initial) {
		return this[Order].reduce((agg, v, i, a)=>fn(agg, this[Data][v], i, a), initial);
	}


	indexOf (id) { return this[Order].indexOf(id); }


	get(id) { return this[Data][id]; }


	getAt (index) {
		var id = this[Order][index];
		return id && this.get(id);
	}


	getPageSource (at=null) {
		if (!this[PageSource]) {
			this[PageSource] = new PageSourceModel(this);
		}

		if(at){console.log('Asked to set current page to: %o',at);}

		return this[PageSource];
	}
}
