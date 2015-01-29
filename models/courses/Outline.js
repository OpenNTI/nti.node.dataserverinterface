import Base from '../Base';

const OUTLINE_CONTENT_CACHE = Symbol('OutlineContents:cache');
const MAX_DEPTH = Symbol('OutlineContents:maximum depth');

function getMaxDepthFrom (n) {
	return (n.contents || [])
		.map(item => getMaxDepthFrom(item) + 1)
		.reduce((max, depth) => Math.max(max, depth), 0);
}

export default class Outline extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
		this.contents = null;
	}


	get () {
		var promise = this[OUTLINE_CONTENT_CACHE];

		if (this.contents) {
			promise = Promise.resolve(this);
		}

		else if (!promise) {
			let assignments = this.parent().getAssignments();
			let contents = this.fetchLinkParsed('contents');

			promise = Promise.all([assignments, contents])
				.then(requests=> {
					let [assignments, contents] = requests;
					Object.assign(this, {
						assignments,
						contents
					});

					delete this[OUTLINE_CONTENT_CACHE];
					return this;
				});

			this[OUTLINE_CONTENT_CACHE] = promise;
		}

		return promise;
	}


	get isNavigable () {
		return (this.href || '').length > 0;
	}


	get isEmpty () {
		return (this.label||'').trim().length === 0 &&
				this.contents.length === 0;
	}


	get label () { return ''; }


	get maxDepth () {
		return (this[MAX_DEPTH] = (this[MAX_DEPTH] || getMaxDepthFrom(this.root)));
	}


	get depth () {return 0;}


	get root () { return this; }


	getNode  (id) {
		if (this.getID() === id) {
			return this;
		}

		return this.contents.reduce((item, potential) => item || potential.getNode(id), null);
	}


	isAssignment  (outlineNodeId, assessmentId) {
		var collection = this.assignments;
		return collection && collection.isAssignment(outlineNodeId, assessmentId);
	}


	getAssignment  (outlineNodeId, assignmentId) {
		var collection = this.assignments;
		return collection && collection.getAssignment(outlineNodeId, assignmentId);
	}


	getAssignments  () {
		var collection = this.assignments;
		if (collection) {
			return collection.getAssignments(this.getID());
		}
		return [];
	}
}
