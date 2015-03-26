import isFunction from '../../utils/isfunction';
import * as MimeTypes from './MimeTypes';
import guid from '../../utils/guid';

const _startTime = Symbol('_startTime');
const _finished = Symbol('_finished');
const _minDuration = Symbol('_minDuration');
const _id = Symbol('_id');
const _halted = Symbol('_halted');

function durationSeconds(startTime = Date.now(), endTime = Date.now()) {
	return (endTime - startTime) / 1000;
}

let mimeTypes = MimeTypes.getTypes();

export default class BasicEvent {
	constructor (mimeType, courseId, RootContextID = courseId, startTime = Date.now(), minimumDurationSeconds = 1) {

		if (! mimeType || ! mimeTypes[mimeType]) {
			console.warn('Unrecognized MimeType for analytics event: \'%s\'', mimeType);
		}

		this[_startTime] = startTime;
		this[_finished] = false;
		this[_minDuration] = minimumDurationSeconds;
		this[_id] = guid();
		this[_halted] = false;

		Object.assign(this, {
			MimeType: mimeType || MimeTypes.UNKNOWN_TYPE,
			RootContextID,
			course: courseId,
			timestamp: null
		});

	}

	static halt(event) {
		event[_halted] = true;
		this.finish(event);
	}

	static finish(event, endTime = Date.now()) {
		if (event.finished) {
			console.warn('finish invoked on an already-finished analytics event. %O', event);
		}
		event.time_length = durationSeconds(event[_startTime], endTime);
		event.timestamp = endTime / 1000; // the server is expecting seconds
		event[_finished] = true;
	}

	get id() {
		return this[_id];
	}

	get finished() {
		return this[_finished];
	}

	halt() {
		this.constructor.halt(this);
	}

	finish (endTime = Date.now()) {
		this.constructor.finish(this, endTime);
	}

	get startTime() {
		return this[_startTime];
	}

	setContextPath (path) {
		this.context_path = path;
	}

	getDuration () {
		return this.finished ? this.time_length : durationSeconds(this._startTime);
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

// export default class BasicEvent {
// 	constructor (courseId, duration) {

// 		Object.assign(this, {
// 			RootContextID: courseId,
// 			course: courseId,
// 			time_length: duration,
// 			timestamp: Date.now() / 1000 //the server is expecting seconds
// 		});
// 	}

// 	setContextPath (path) {
// 		this.context_path = path;
// 	}

// 	getDuration () {
// 		return this.time_length;
// 	}

// 	getData () {
// 		let k, v, d = {};

// 		for (k in this) {
// 			if (!this.hasOwnProperty(k)) {continue;}
// 			v = this[k];
// 			if (v != null && !isFunction(v)) {

// 				if (v && isFunction(v.getData)) {
// 					v = v.getData();
// 				}

// 				d[k] = v;
// 			}
// 		}

// 		return d;
// 	}
// }
