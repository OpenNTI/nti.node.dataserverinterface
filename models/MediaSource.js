
const Parent = Symbol.for('Parent');
const Service = Symbol.for('Service');

export default class MediaSource {
	constructor (service, parent, data) {
		this[Parent] = parent;
		this[Service] = service;

		Object.assign(this, data);
	}
}
