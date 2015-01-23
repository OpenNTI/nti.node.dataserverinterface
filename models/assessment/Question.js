'use strict';


var base = require('../mixins/Base');
var content = require('../mixins/HasContent');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var parser = require('../../utils/parse-object');


function Question(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	Object.assign(this, data);

	content.initMixin.call(this, data);

	this.parts = data.parts.map(p=>parser(this, p));

	if (this.wordbank) {
		this.wordbank = parser(this, this.wordbank);
	}
}

Object.assign(Question.prototype, base, content, {

	getVideos: function() {
		var all = parser.getModel('assessment.part').prototype.getVideos.call(this);

		for(let p of this.parts) {
			all.push.apply(all, p.getVideos());
		}
		return all;
	},



	getSubmission: function () {
		let Model = parser.getModel('assessment.questionsubmission');
		return Model.build(this._service, {
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

module.exports = Question;
