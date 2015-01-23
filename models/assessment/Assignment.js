'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var parser = require('../../utils/parse-object');


function Assignment(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	this.__setup(data);
}

const ActiveSavePointPost = Symbol('ActiveSavePointPost');

Object.assign(Assignment.prototype, base, {
	isSubmittable: true,

	__setup: function (data) {
		Object.assign(this, data);

		this.__parseDate('available_for_submission_beginning');
		this.__parseDate('available_for_submission_ending');

		this.parts = (data.parts || []).map(p => parser(this, p));
	},


	/**
	 * Checks to see if the NTIID is within this Assignment (Checking the QuestionSet's id and all questions id's)
	 *
	 * @param {String} id NTIID
	 */
	containsId: function(id) {
		var items = this.parts.filter(function(p) {
			return p.containsId(id);
		});
		return items.length > 0;
	},


	isNonSubmit: function () {
		var p = this.parts;

		if (this.hasOwnProperty('NoSubmit')) {
			return this.NoSubmit;
		}

		if (this.hasOwnProperty('no_submit')) {
			return this.no_submit;
		}

		return !p || p.length === 0 || /no_submit/.test(this.category_name);
	},


	canBeSubmitted: function () {
		return !this.isNonSubmit();
	},


	isLate: function(date) {
		return date > this.getDueDate();
	},


	getDueDate: function() {
		return this.available_for_submission_ending;
	},


	getQuestion: function (id) {
		function get(question, part) {
			return question || part.getQuestion(id);
		}
		return this.parts.reduce(get, null);
	},


	getQuestions: function () {
		function get(list, part) {
			return list.concat(part.getQuestions());
		}
		this.parts.reduce(get, []);
	},


	getQuestionCount: function () {
		function sum(agg, part) {
			return agg + part.getQuestionCount();
		}
		return this.parts.reduce(sum, 0);
	},


	getSubmission: function () {
		let model = parser.getModel('assessment.assignmentsubmission');
		var s = model.build(this._service, {
			assignmentId: this.getID(),
			parts: []
		});

		s.parts = this.parts.map(function(p) {
			p = p.getSubmission();
			p.__reParent(s);
			return p;
		});

		return s;
	},


	loadPreviousSubmission: function () {
		return this.loadHistory()
			.catch(this.loadSavePoint.bind(this));
	},


	loadHistory: function () {
		var service = this._service;
		var link = this.getLink('History');

		if (!link) {
			return Promise.reject('No Link');
		}

		return service.get(link).then(data=>parser(this, data));
	},


	loadSavePoint: function() {
		var me = this;
		var service = me._service;
		var link = me.getLink('Savepoint');

		if (!link) {
			return Promise.reject('No Link');
		}

		return service.get(link)
			.then(data=>parser(me, data));
	},


	postSavePoint: function (data) {
		var link = this.getLink('Savepoint');
		if (!link) {
			return Promise.resolve({});
		}

		var last = this[ActiveSavePointPost];
		if (last && last.abort) {
			last.abort();
		}

		var result = this[ActiveSavePointPost] = this._service.post(link, data);

		result.catch(()=>{}).then(()=>{
			if (result === this[ActiveSavePointPost]) {
				delete this[ActiveSavePointPost];
			}
		});

		return result;
	}

});


module.exports = Assignment;
