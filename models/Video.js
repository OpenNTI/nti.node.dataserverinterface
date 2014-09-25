'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');
var withValue = require('../utils/object-attribute-withvalue');
var isEmpty = require('../utils/isempty');

var MediaSource = require('./MediaSource');

var NO_TRANSCRIPT = 'No Transcript';
var NO_TRANSCRIPT_LANG = 'No Transcript for the requested language.';

function Video(service, data, parent) {
	Object.defineProperty(this, '_service', withValue(service));
	Object.defineProperty(this, '_parent', withValue(parent));

	var sources = data.sources;
	
	merge(this, data);

	this.sources = sources.map(function(item) {
		return MediaSource.parse(service, item, this);
	}.bind(this));
}

merge(Video.prototype, {

	/**
	 * @param {String} [lang] Request a language specific transcript. If
	 *                        nothing is provided, it will default to english.
	 * @return {Promise}
	 */
	getTranscript: function(lang) {
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

});


function parse(service, data, parent) {
	if (data instanceof Video) {
		return data;
	}

	return new Video(service, data, parent);
}


//Static defs
Video.NO_TRANSCRIPT = NO_TRANSCRIPT;
Video.NO_TRANSCRIPT_LANG = NO_TRANSCRIPT_LANG;
Video.parse = parse.bind(Video);

module.exports = Video;
