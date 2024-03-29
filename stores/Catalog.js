import {EventEmitter} from 'events';


import forwardFunctions from '../utils/function-forwarding';
import waitFor from '../utils/waitfor';

import {parseListFn} from './Library';

import {Service, Pending} from '../CommonSymbols';

export default class Catalog extends EventEmitter {
	static load (service, reload) {
		return get(service, service.getCoursesCatalogURL(), reload)
			.then(data => {
				let catalog = new this(service, data);
				return waitFor(catalog[Pending]).then(() => catalog);
			});
	}

	constructor (service, data) {
		let pending = [];

		this[Service] = service;
		this[Pending] = pending;

		Object.assign(this, data,
			forwardFunctions(['every','filter','forEach','map','reduce'], 'Items'));

		this.onChange = this.onChange.bind(this);

		let parseList = parseListFn(this, service, pending);

		this.Items = parseList(data.Items);
	}


	onChange () {
		this.emit('changed', this);
	}


	findEntry (entryId) {
		let found;

		this.every(course => {
			if (course.getID() === entryId) {
				found = course;
			}

			return !found;
		});

		return found;
	}
}


function get(s, url, ignoreCache) {
	let cache = s.getDataCache();

	let cached = cache.get(url), result;
	if (!cached || ignoreCache) {
		result = s.get(url)
			.catch(()=>({titles: [], Items: []}))
			.then(data =>cache.set(url, data) && data);
	} else {
		result = Promise.resolve(cached);
	}

	return result;
}
