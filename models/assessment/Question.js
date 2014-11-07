'use strict';

var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var fixRefs = require('../../utils/rebase-references');
var parseObject = require('../../utils/parse-object');

var WordBank = require('./WordBank');

function Question(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	merge(this, data);

	this.parts = data.parts.map(parseObject.bind(this, this));

	if (this.wordbank) {
		this.wordbank = WordBank.parse(service, this, this.wordbank);
	}

	try {
		var root = this.getContentRoot();
		this.content = fixRefs(this.content, root);
	} catch (e) {
		delete this.content;
		console.error('Content cannot be rooted. %s', e.stack || e.message || e);
	}
}

merge(Question.prototype, base, {

	getContentRoot: function () {
		return this.ContentRoot || this.up('getContentRoot').getContentRoot();
	}

});


function parse(service, parent, data) {
	return new Question(service, parent, data);
}

Question.parse = parse;

module.exports = Question;
