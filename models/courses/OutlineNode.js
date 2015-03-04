import Outline from './Outline';
import {Parser as parse} from '../../CommonSymbols';

import path from 'path';

import fallbackOverview from './_fallbacks.OverviewFromToC';

import {encodeForURI} from '../../utils/ntiids';
import emptyFunction from '../../utils/empty-function';

var emptyCourseObject = {getID:emptyFunction};

const Progress = Symbol.for('Progress');

function getCourse (node) {
	return node.root.parent();
}

export default class OutlineNode extends Outline {
	constructor(service, parent, data) {
		super(service, parent, data);
		let p = c=>c.map(o => this[parse](o));
		this.contents = p(data.contents|| []);
	}

	get label () { return this.DCTitle; }


	getID () {
		return this.ContentNTIID;
	}


	get href () {
		var courseId = (getCourse(this) || emptyCourseObject).getID();
		var ref = this.ref;

		if (!ref) {
			return undefined;
		}

		return path.join('course', encodeForURI(courseId), 'o', ref) + '/';
	}


	get ref () {
		var id = this.getID();

		if (!id) {
			return undefined;
		}

		return path.join(encodeForURI(id));
	}


	get depth () {
		var type = super.constructor;
		return this.parents({test:p=>p instanceof type}).length;
	}


	get root () {
		var type = super.constructor;
		return this.parent({
			test: o=>o.constructor === type
		});
	}


	get isOpen () {}


	get isLeaf () {}


	get isHeading () {}


	get isSection () {}


	isAssignment  (assessmentId) {
		return this.root.isAssignment(this.getID(), assessmentId);
	}


	getAssignment  (assignmentId) {
		return this.root.getAssignment(this.getID(), assignmentId);
	}


	getAssignments  () {
		return this.root.getAssignments();
	}


	getContent () {
		let link = 'overview-content';
		let content = this.hasLink(link) ?
			this.fetchLink(link).then(collateVideo) :
			getContentFallback(this);

		return Promise.all([this.getProgress(), content])
			.then(progressAndContent=>{
				let [progress, content] = progressAndContent;

				applyProgress(content, progress);

				return content;
			});
	}


	getProgress () {
		var link = 'Progress';

		if (!this.hasLink(link)) {
			return Promise.resolve(null);
		}

		return this.fetchLinkParsed(link);
	}
}


function collateVideo(json) {
	var re = /ntivideo$/;
	function collate(list, current) {
		var last = list[list.length - 1];
		if (re.test(current.MimeType)) {
			//last was a video...
			if (last && re.test(last.MimeType)){
				last = list[list.length - 1] = {
					MimeType: 'application/vnd.nextthought.ntivideoset',
					Items: [last]
				};
			}

			//The previous item is a video set...(or we just created it)
			if (last && /ntivideoset$/.test(last.MimeType)) {
				last.Items.push(current);
				return list;
			}

		} else if (current.Items) {
			current = collateVideo(current);
		}

		list.push(current);
		return list;
	}

	json.Items = json.Items.reduce(collate, []);

	return json;
}


function applyProgress(content, progress) {
	if (!content) {return;}

	function findWithFuzzyKey (c, key) {
		key = key.toLowerCase();
		key = Object.keys(c).reduce(
			(found, v)=> found || (v.toLowerCase() === key ? v : found),
			null);

		return key && c[key];
	}

	var id = ['Target-NTIID', 'NTIID'].reduce(
			(id, key)=> id || findWithFuzzyKey(content, key), null);

	var nodeProgress = id && progress.getProgress(id);

	if (nodeProgress != null) {
		content[Progress] = nodeProgress;
	}

	if (Array.isArray(content.Items)) {
		content.Items.forEach(item=>applyProgress(item, progress));
	}
}

/*******************************************************************************
 * FALLBACK TEMPORARY STUFF BELOW THIS POINT
 */
function getContentFallback(outlineNode) {
	console.debug('[FALLBACK] Deriving OutlineNode(%s) content', outlineNode.getID());
	var course = getCourse(outlineNode);
	var bundle = course && course.ContentPackageBundle;
	var pkg = ((bundle && bundle.ContentPackages) || [])[0];
	var contentId = outlineNode.getID();

	var p = pkg ? pkg.getTableOfContents() : Promise.reject('No Content Package');

	return p.then(function(toc) {
		var tocNode = toc.getNode(contentId);
		var content = fallbackOverview(tocNode, outlineNode);
		if (!content) {
			console.error('Fallback Content failed');
		}
		return content;
	});
}
