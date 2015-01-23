'use strict';

var Base = require('../Part');

var isShortAnswer = RegExp.prototype.test.bind(/ShortAnswer/i);
var hasInputs = RegExp.prototype.test.bind(/<input/i);

var tags = /<input[^>]+blankfield[^>]+>/ig;
var keyName = /name=['"]([^'"]+)['"]/i;

var ValueKeys = Symbol('value-keys');

function FillInTheBlank(service, parent, data) {
	if (isShortAnswer(data.MimeType)) {
		// FillInTheBlankShortAnswer is F'd up... the content has input boxes in many
		// instances (possibly all instances). That should be illegal. The text with
		// interspersed inputs should ONLY in the 'input' field.
		// So, if we detect that the content has <input tags, prefix the content to
		// the input field, and blank out the content field.
		if (hasInputs(data.content)) {
			data.input = data.content + ' ' + (data.input || '');
			data.content = '';
		}
	}


	Base.call(this, service, parent, data);

	this[ValueKeys] = this.input.match(tags).map(s=>(s.match(keyName)||{})[1]);
}


FillInTheBlank.prototype = Object.create(Base.prototype);
Object.assign(FillInTheBlank.prototype, {
	__contentProperties: Base.prototype.__contentProperties.concat(['input']),
	constructor: FillInTheBlank,


	isAnswered (partValue) {
		var maybe = true;
		var keys = this[ValueKeys];

		for(let i of keys) {
			//all values have to be non-nully
			maybe = maybe && partValue && partValue[i] != null;
		}

		return maybe;
	}
});


module.exports = FillInTheBlank;
