'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var assign = require('object-assign');
var define = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');
var isEmpty = require('../utils/isempty');

var MediaSource = require('./MediaSource');

var NO_TRANSCRIPT = 'No Transcript';
var NO_TRANSCRIPT_LANG = 'No Transcript for the requested language.';

function Video(service, parent, data) {
	define(this, {
		_service: withValue(service),
		_parent: withValue(parent)
	});

	var sources = data.sources;

	assign(this, data);

	this.sources = sources.map(function(item) {
		return MediaSource.parse(service, this, item);
	}.bind(this));
}

assign(Video.prototype, {

	getID: function() {
		return this.ntiid;
	},


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
	},


	getPageSource: function() {
		return this._parent.getPageSource();
	}

});


function parse(service, parent, data) {
	if (data instanceof Video) {
		return data;
	}

	return new Video(service, parent, data);
}


//Static defs
Video.NO_TRANSCRIPT = NO_TRANSCRIPT;
Video.NO_TRANSCRIPT_LANG = NO_TRANSCRIPT_LANG;
Video.parse = parse;

module.exports = Video;
