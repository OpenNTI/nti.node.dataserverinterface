import path from 'path';

import Base from './Base';

import {encodeForURI as encodeNTIIDForURI} from '../utils/ntiids';

import {Parent, Service} from '../CommonSymbols';

export default class VideoIndexBackedPageSource extends Base {

	constructor (index) {
		super(index[Service], index);
	}


	getPagesAround (pageId) {
		var nodes = this[Parent];
		var index = nodes.reduce(
			(found, node, index) => (typeof found !== 'number' && node.getID() === pageId) ? index : found,
			null);


		var next = nodes.getAt(index + 1);
		var prev = nodes.getAt(index - 1);

		return {
			total: nodes.length,
			index: index,
			next: buildRef(next),
			prev: buildRef(prev)
		};
	}

}


function buildRef(node) {
	var id = node && node.getID();
	return id && {
		ntiid: id,
		title: node.title,
		ref: path.join('v', encodeNTIIDForURI(id))
	};
}
