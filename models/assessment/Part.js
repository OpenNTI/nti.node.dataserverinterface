'use strict';

var assign = require('object-assign');

var base = require('../mixins/Base');
var content = require('../mixins/HasContent');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');

var parseObject = require('../../utils/parse-object');

var toArray = require('../../utils/toarray');


function Part(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	assign(this, data);

	content.initMixin.call(this, data, this.__contentProperties);

	if (this.wordbank) {
		this.wordbank = parseObject(this, this.wordbank);
	}

	/*
		hints <-Parse
		solutions <-Parse
	*/
}

assign(Part.prototype, base, content, {
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

		nodes.forEach(function (i) {
			var o = {};
			toArray(i.getElementsByTagName('param')).forEach(function(p) {
				o[p.getAttribute('name')] = p.getAttribute('value');
			});
			out.push(o);
		});

		return out;
	}
});


function parse(service, parent, data) {
	return new Part(service, parent, data);
}

Part.parse = parse;

module.exports = Part;
