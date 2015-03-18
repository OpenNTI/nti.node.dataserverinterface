import {EventEmitter} from 'events';

import {Service, Pending} from '../CommonSymbols';

export default class UserData extends EventEmitter {

	constructor (service, source) {
		let pending = [];

		this[Service] = service;
		this[Pending] = pending;

		let load = service.get(source);

		pending.push(load);
	}

}
