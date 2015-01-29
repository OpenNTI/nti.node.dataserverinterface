import Base from './Base';

import {encodeForURI as encodeNTIIDForURI} from '../utils/ntiids';

const Service = Symbol.for('Service');

export default class TableOfContentsBackedPageSource extends Base{
	constructor (ToC, root) {
		super(ToC[Service], ToC);

		this.root = ToC.getNode(root);

		try {
			this.pagesInRange = flatten(this.root).filter(suppressed);
		}
		catch(e) {
			console.error(e.stack || e.message || e);
			throw e;
		}
	}


	getPagesAround (pageId) {
		var query = './/*[@ntiid="' + pageId + '"]';
		var {root} = this;
		var node = root.find(query) || (root.get('ntiid') === pageId && root);
		var nodes = this.pagesInRange;

		var index = nodes.indexOf(node);

		var next = nodes[index + 1];
		var prev = nodes[index - 1];

		return {
			total: nodes.length,
			index: index,
			next: buildRef(next, root),
			prev: buildRef(prev, root)
		};
	}

}


function buildRef(node, root) {
	return node && {
		ntiid: node.get('ntiid'),
		title: node.get('label'),
		// Lets not make paths longer than they have to...
		// The pattern will be the view is prefixed with the root in the slug.
		// Adding a page id at the end would be redundant. The "Root" is the
		// "default" pageId.
		ref: node === root ?
			'/' : encodeNTIIDForURI(node.get('ntiid'))
	};
}


function suppressed(node) {
	var isAnchor = suppressed.is || (suppressed.id = /#/);
	var isTopic = suppressed.tag || (suppressed.tag = /topic/i);

	return node && isTopic.test(node.tag) && !isAnchor.test(node.get('href'));
}

function flatten(node) {
	var fn = flatten.fnLoop || (flatten.fnLoop = (a,n)=>a.concat(flatten(n)));
	return [node].concat(node._children.reduce(fn, []));
}
