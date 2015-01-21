'use strict';


var base = require('../mixins/Base');
var content = require('../mixins/HasContent');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var toArray = require('../../utils/toarray');

var parseKey = require('../../utils/parse-object-at-key');

function Part(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);


	content.initMixin.call(this, data, this.__contentProperties);

	//Rules:
	// Show Hints from start if they are present. If more than one, increment which one you see every time your show.
	// Show Solutions if the part is answered & incorrect (as apposed to correct or 'unknown'), and there are solutions

	var parse = parseKey.bind(this, this);
	parse('hints');
	parse('solutions');
	parse('wordbank');

}

Object.assign(Part.prototype, base, content, {
	__contentProperties: ['content', 'explanation', 'answerLabel'],

	getQuestionId: function() {
		return this._parent.getID();
	},


	getPartIndex: function() {
		return this._parent.parts.indexOf(this);
	},


	getVideos: function () {
		if (!global.DOMParser) {
			console.error('Environment does not support DOMParser() no related videos');
			return [];
		}

		var out = [],
			dom = new global.DOMParser().parseFromString(this.content, 'text/xml'),
			nodes = toArray(dom.querySelectorAll('object.naqvideo'));

		for(let i of nodes) {
			let o = {};

			for(let p of toArray(i.getElementsByTagName('param'))) {
				o[p.getAttribute('name')] = p.getAttribute('value');
			}

			out.push(o);
		}

		return out;
	},


	getWordBankEntry: function (wid) {
		var p = this._parent || {};
		var wordbanks = [this.wordbank, p.wordbank].filter(function(x){return x;});

		function get(found, x){
			return found || x && x.getEntry(wid);
		}

		return wordbanks.reduce(get, null);
	},

	updateFromAssessed: function (assessedPart) {
		if (!assessedPart) {
			throw new Error('[Assessment Fillin]: Invalid Argument');
		}

		if (assessedPart.getQuestionId() !== this.getQuestionId() ||
			assessedPart.getPartIndex() !== this.getPartIndex()) {
			throw new Error('[Assessment Fillin]: Miss-Matched Question/Part');
		}

		for(let p of ['hints', 'solutions']) {
			//Only update this[p] if its blank, or assessedPart[p] is truthy
			// (do not blank out this[p] if its set and assessedPart[p] is not.)
			if (!this[p] || assessedPart[p]) {
				this[p] = assessedPart[p];
			}
		}

		if (assessedPart.explanation) {
			delete this.explanation;
			content.initMixin.call(this, assessedPart, ['explanation']);
		}
	}
});


function parse(service, parent, data) {
	return new Part(service, parent, data);
}

Part.parse = parse;

module.exports = Part;
