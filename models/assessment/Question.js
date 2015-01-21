'use strict';


var base = require('../mixins/Base');
var content = require('../mixins/HasContent');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var parseObject = require('../../utils/parse-object');

var Part = require('./Part');
var QuestionSubmission = require('./QuestionSubmission');

function Question(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);

	content.initMixin.call(this, data);

	this.parts = data.parts.map(parseObject.bind(this, this));

	if (this.wordbank) {
		this.wordbank = parseObject(this, this.wordbank);
	}
}

Object.assign(Question.prototype, base, content, {

	getVideos: function() {
		var all = Part.prototype.getVideos.call(this);
		for(let p of this.parts) {
			all.push.apply(all, p.getVideos());
		}
		return all;
	},



	getSubmission: function () {
		return QuestionSubmission.build(this._service, {
			ContainerId: this.containerId,
			NTIID: this.getID(),
			questionId: this.getID(),
			parts: this.parts.map(()=>null)
		});
	},



	isAnswered: function(questionSubmission) {
		var expect = this.parts.length;
		var {parts} = questionSubmission;

		return this.parts.filter((p,i)=>p.isAnswered(parts[i])).length === expect;
	}

});


function parse(service, parent, data) {
	return new Question(service, parent, data);
}

Question.parse = parse;

module.exports = Question;
