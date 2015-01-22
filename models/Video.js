import isEmpty from '../utils/isempty';
import parser from '../utils/parse-object';

const Parent = Symbol.for('Parent');
const Service = Symbol.for('Service');

const NO_TRANSCRIPT = 'No Transcript';
const NO_TRANSCRIPT_LANG = 'No Transcript for the requested language.';

export default class Video {
	static parse (service, parent, data) {
		return new this(service, parent, data);
	}

	constructor (service, parent, data) {
		this[Service] = service;
		this[Parent] = parent;

		Object.assign(this, {
			NO_TRANSCRIPT,
			NO_TRANSCRIPT_LANG
		});

		var sources = data.sources;

		Object.assign(this, data);

		var MediaSource = parser.getModel('mediasource');

		this.sources = sources.map(item =>
			MediaSource.parse(service, this, item)
		);
	}



	getID () {
		return this.ntiid;
	}


	/**
	 * @param {String} [lang] Request a language specific transcript. If
	 *                        nothing is provided, it will default to english.
	 * @return {Promise}
	 */
	getTranscript (lang) {
		var target = lang || 'en';
		var scripts = this.transcripts;

		if (isEmpty(scripts)) {
			return Promise.reject(NO_TRANSCRIPT);
		}

		function find(result, potential) {
			return result || (potential.lang === target && potential);
		}

		target = this.transcripts.reduce(find, null);
		if (!target) {
			return Promise.reject(NO_TRANSCRIPT_LANG);
		}

		return this._service.get(target.src);
	}


	getPageSource () {
		return this._parent.getPageSource();
	}
}
