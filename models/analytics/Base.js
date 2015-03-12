import isFunction from '../../utils/isfunction';

export default class BasicEvent {
	constructor (courseId, duration) {

		Object.assign(this, {
			RootContextID: courseId,
			course: courseId,
			time_length: duration,
			timestamp: Date.now() / 1000 //the server is expecting seconds
		});
	}

	setContextPath (path) {
		this.context_path = path;
	}

	getDuration () {
		return this.time_length;
	}

	getData () {
		let k, v, d = {};

		for (k in this) {
			if (!this.hasOwnProperty(k)) {continue;}
			v = this[k];
			if (v != null && !isFunction(v)) {

				if (v && isFunction(v.getData)) {
					v = v.getData();
				}

				d[k] = v;
			}
		}

		return d;
	}
}
