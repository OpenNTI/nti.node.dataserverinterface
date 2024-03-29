import Base from './Base';
import Url from 'url';
import path from 'path';

import QueryString from 'query-string';

import {REL_USER_GENERATED_DATA, REL_RELEVANT_USER_GENERATED_DATA} from '../constants';

import fixRefs from '../utils/rebase-references';

import {Service, Pending, Parser as parse} from '../CommonSymbols';

import UserDataStore from '../stores/UserData';

const UserData = Symbol('UserData');

export default class PageInfo extends Base {
	constructor (service, data) {
		super(service, null, data);

		if (data.AssessmentItems) {
			this.AssessmentItems = setupAssessmentItems(data.AssessmentItems, this);
		}
	}


	getContentRoot () {
		let url = Url.parse(this.getLink('content'));

		url.pathname = path.dirname(url.pathname) + '/';

		// images and other resources will be resolved relative
		// to this url; ensure there's no hash or query string.
		url.hash = null;
		url.query = null;
		url.search = null;

		return url.format();
	}

	getContent () {
		let root = this.getContentRoot();

		return this.fetchLink('content')
			.then(html=>fixRefs(html, root));
	}


	getResource (url) {
		return this[Service].get(url);
	}


	getPackageID () {
		function bestGuess() {
			throw new Error('PageInfo does not declare the package ID.');
		}

		return this.ContentPackageNTIID || bestGuess(this);
	}


	getAssessmentQuestion (questionId) {
		function find(found, item) {
			return found || (
				//Find in Assignments/QuestionSets
				(item.getQuestion && item.getQuestion(questionId)) ||
				//or find the top-level question:
				(item.getID() === questionId && item)
			);
		}
		return (this.AssessmentItems || []).reduce(find, null);
	}


	getUserDataLastOfType (mimeType) {
		let link = this.getLink(REL_USER_GENERATED_DATA);
		let url = link && Url.parse(link);
		let o = {
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
			.then(objects=>this[parse](objects.Items[0]));
	}


	getUserData () {
		let store = this[UserData];

		if (!store) {
			store = this[UserData] = new UserDataStore(
				this[Service],
				this.getID(),
				this.getLink(REL_RELEVANT_USER_GENERATED_DATA)
			);

			this.addToPending(...store[Pending]);
		}

		return Promise.resolve(store);//in the future, this may need to be async...
	}
}


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
	let order = assessmentItemOrder.order = (assessmentItemOrder.order || {
		'application/vnd.nextthought.assessment.assignment': 0,
		'application/vnd.nextthought.naquestionset': 1,
		'application/vnd.nextthought.naquestion': 2,
	});

	a = order[a.MimeType] || 3;
	b = order[b.MimeType] || 3;

	return a === b ? 0 : (a < b ? -1 : 1);
}


function setupAssessmentItems(items, pageInfo) {
	items = items.map(o=>pageInfo[parse](o));
	items.sort(assessmentItemOrder);

	let sets = items.filter(o=>o && o.containsId);

	//Remove questions & questionsets that are embedded within Assignments and QuestionSets...leave only top-level items.
	items = items.filter(o=>
		!sets.reduce((found, set) =>
			found || set.containsId(o.getID()), null)
	);

	return items;
}
