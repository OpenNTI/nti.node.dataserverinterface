import Video from './Video';
import PageSourceModel from './VideoIndexBackedPageSource';
import {Service, Parent} from '../CommonSymbols';

const PageSource = Symbol('PageSource');
const Order = Symbol('Order');
const Data = Symbol('Data');
const Containers = Symbol('Containers');

const getVideo = (s,i,v) => v instanceof Video ? v : new Video(s, i, v);

export default class VideoIndex {
	static parse (service, parent, data, order, containers) {
		console.error('Where ?');
		return new this(service, parent, data, order, containers);
	}

	constructor (service, parent, data, order, containers) {

		this[Service] = service;
		this[Parent] = parent;
		this[Order] = order || data[Order] || [];
		this[Data] = {};
		this[Containers] = containers;

		delete data[Order];
		delete data._order;

		for(let key in data) {
			if (data.hasOwnProperty(key)) {
				this[Data][key] = getVideo(service, this, data[key]);
			}
		}
	}


	get length () { return this[Order].length; }


	asJSON () {
		console.log('Still used?');
		return Object.assign({}, this[Data]);
	}


	combine (that) {
		let order = this[Order].concat(that[Order]);
		let data = Object.assign({}, this[Data], that[Data]);
		let containers = Object.assign({}, this[Containers], that[Containers]);

		return new this.constructor(this[Service], this[Parent], data, order, containers);
	}


	scopped (containerId) {
		let list = this[Containers][containerId] || [];

		return this.filter(o=>list.indexOf(o.getID())>=0);
	}


	filter (fn) {
		let data = {};
		let order = this[Order].filter((v, i, a) => {
			let o = this[Data][v];
			let pass = fn(o, i, a);
			if (pass) {
				data[v] = o;
			}
			return pass;
		});

		return new this.constructor(this[Service], this[Parent], data, order);
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
		let id = this[Order][index];
		return id && this.get(id);
	}


	getPageSource () {
		if (!this[PageSource]) {
			this[PageSource] = new PageSourceModel(this);
		}

		return this[PageSource];
	}
}
