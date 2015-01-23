'use strict';

var base = require('./mixins/Base');
var Url = require('url');
var path = require('path');

var QueryString = require('query-string');

var constants = require('../constants');
var parseObject = require('../utils/parse-object');


var fixRefs = require('../utils/rebase-references');


const Service = Symbol.for('Service');

function PageInfo(service, data) {
	this[Service] = service;
	Object.assign(this, data);

	if (data.AssessmentItems) {
		this.AssessmentItems = setupAssessmentItems(data.AssessmentItems, this);
	}
}

Object.assign(PageInfo.prototype, base, {

	getContentRoot: function () {
		var url = Url.parse(this.getLink('content'));

		url.pathname = path.dirname(url.pathname) + '/';

		// images and other resources will be resolved relative
		// to this url; ensure there's no hash or query string.
		url.hash = null;
		url.query = null;
		url.search = null;

		return url.format();
	},

	getContent: function() {
		var url = this.getLink('content');
		var root = this.getContentRoot();

		return this[Service].get(url)
			.then(function (html){ return fixRefs(html, root); });
	},


	getResource: function(url) {
		return this[Service].get(url);
	},


	getPackageID: function () {
		function bestGuess() {
			throw new Error('PageInfo does not declare the package ID.');
		}

		return this.ContentPackageNTIID || bestGuess(this);
	},


	getAssessmentQuestion: function (questionId) {
		function find(found, item) {
			return found || (
				//Find in Assignments/QuestionSets
				(item.getQuestion && item.getQuestion(questionId)) ||
				//or find the top-level question:
				(item.getID() === questionId && item)
			);
		}
		return (this.AssessmentItems || []).reduce(find, null);
	},


	getUserDataLastOfType: function (mimeType) {
		var link = this.getLink(constants.REL_USER_GENERATED_DATA);
		var url = link && Url.parse(link);
		var o = {
			accept: mimeType,
			batchStart: 0, batchSize: 1,
			sortOn: 'lastModified',
			sortOrder: 'descending',
			filter: 'TopLevel'
		};

		if (!url) {
			return Promise.reject('No Link');
		}

		url.search = QueryString.stringify(o);

		return this.getResource(url.format())
			.then(objects=>	parseObject(this, objects.Items[0]));
	}
});


module.exports = PageInfo;



// AssessmentItem Setup functions -- defined here to stay out of the way.

/**
 * Puts AssessmentItems in order of:
 * 	1: Assignments
 * 	2: QuestionSets
 * 	3: Questions
 *
 * @param {Object} a
 * @param {Object} b
 */
function assessmentItemOrder(a, b) {
	var order = assessmentItemOrder.order = (assessmentItemOrder.order || {
		'application/vnd.nextthought.assessment.assignment': 0,
		'application/vnd.nextthought.naquestionset': 1,
		'application/vnd.nextthought.naquestion': 2,
	});

	a = order[a.MimeType] || 3;
	b = order[b.MimeType] || 3;

	return a === b ? 0 : (a < b ? -1 : 1);
}


function setupAssessmentItems(items, pageInfo) {
	items = items.map(o=>parseObject(pageInfo, o));
	items.sort(assessmentItemOrder);

	var sets = items.filter(o=>o && o.containsId);

	//Remove questions & questionsets that are embedded within Assignments and QuestionSets...leave only top-level items.
	items = items.filter(o=>
		!sets.reduce((found, set) =>
			found || set.containsId(o.getID()), null)
	);

	return items;
}
