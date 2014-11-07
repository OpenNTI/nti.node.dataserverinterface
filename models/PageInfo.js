'use strict';

var Promise = global.Promise || require('es6-promise').Promise;

var merge = require('merge');
var base = require('./mixins/Base');
var Url = require('url');
var path = require('path');

var constants = require('../constants');
var parseObject = require('../utils/parse-object');

var withValue = require('../utils/object-attribute-withvalue');
var toQueryString = require('../utils/object-to-querystring');
var fixRefs = require('../utils/rebase-references');



function PageInfo(service, data) {
	Object.defineProperty(this, '_service', withValue(service));
	merge(this, data);

	if (data.AssessmentItems) {
		this.AssessmentItems = setupAssessmentItems(data.AssessmentItems, this);
	}
}

merge(PageInfo.prototype, base, {

	getContentRoot: function () {
		var url = Url.parse(this.getLink('content'));

		url.pathname = path.dirname(url.pathname) + '/';

		return url.format();
	},


	getContent: function() {
		var url = this.getLink('content');
		var root = this.getContentRoot();

		return this._service.get(url)
			.then(function (html){ return fixRefs(html, root); });
	},


	getResource: function(url) {
		return this._service.get(url);
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
		return this.AssessmentItems.reduce(find, null);
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

		url.search = toQueryString(o);

		return this.getResource(url.format())
			.then(function(objects) {
				var item = objects.Items[0];
				return parseObject(this, item);
			}.bind(this));
	}
});



function parse(service, data) {
	return new PageInfo(service, data);
}

PageInfo.parse = parse;

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
	items = items.map(parseObject.bind(pageInfo, pageInfo));
	items.sort(assessmentItemOrder);

	var sets = items.filter(function(o) {return o.containsId;});

	//Remove questions & questionsets that are embedded within Assignments and QuestionSets...leave only top-level items.
	items = items.filter(function(o) {
		function findReferences(found, set) {
			return found || set.containsId(o.getID()); }

		return !sets.reduce(findReferences, null);
	});

	return items;
}
