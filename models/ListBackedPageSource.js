import {encodeForURI} from '../utils/ntiids';

export default class ListBackedPageSource {

	constructor (list) {
		this.list = list;
	}


	getPagesAround (pageId) {
		const nodes = this.list;
		const index = nodes.reduce(
			(found, node, index) =>
				(typeof found !== 'number' && node.getID() === pageId) ? index : found,
			null);

		let next = nodes[index + 1];
		let prev = nodes[index - 1];

		return {
			total: nodes.length,
			index: index,
			next: buildRef(next),
			prev: buildRef(prev)
		};
	}

}


function buildRef(node) {
	return node && {
		ntiid: node.getID(),
		title: node.title,
		ref: encodeForURI(node.getID())
	};
}
