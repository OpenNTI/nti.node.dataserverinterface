import Base from '../Base';
import {
	Service
} from '../../CommonSymbols';

import isEmpty from '../../utils/isempty';
import setAndEmit from '../../utils/getsethandler';
import urlJoin from '../../utils/urljoin';


import assets from '../mixins/PresentationResources';

import VideoIndex from '../VideoIndex';
import ToC from '../XMLBasedTableOfContents';

const VideoIndexReqest = Symbol('VideoIndexReqest');

export default class Package extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, assets);

		this.author = (data.DCCreator || []).join(', ');

		this.addToPending(
			this.getAsset('landing').then(setAndEmit(this, 'icon')),
			this.getAsset('thumb').then(setAndEmit(this, 'thumb'))
		);
	}


	getDefaultAssetRoot () {
		let root = this.root;

		if (!root) {
			console.error('No root for content package: ', this);
			return '';
		}

		return urlJoin(root, 'presentation-assets', 'webapp', 'v1');
	}


	getTableOfContents () {
		let service = this[Service];
		let toc = this.tableOfContents;
		let cache = service.getDataCache();
		let cached = cache.get(this.index);

		if (!toc) {
			toc = cached ?
				Promise.resolve(cached) :
				service.get(this.index).then(data =>
						cache.set(this.index, data) && data);

			toc = toc.then(o => new ToC(service, this, o));

			this.tableOfContents = toc;
		}

		return toc;
	}


	getVideoIndex () {
		let service = this[Service];
		let promise = this[VideoIndexReqest];
		let cache = service.getDataCache();

		function find(toc) {
			return toc.getVideoIndexRef() || Promise.reject('No Video Index');
		}

		function get(url) {
			let cached = cache.get(url);
			if (cached) {
				return cached;
			}

			return service.get(url)
				.then(data => cache.set(url, data) && data);
		}


		if (!promise) {
			this[VideoIndexReqest] = promise = this.getTableOfContents()
				.then(toc =>
					Promise.resolve(toc)
						.then(find)
						.then(urlJoin.bind(this, this.root))
						.then(get)
						.then(parseVideoIndex.bind(this, toc)));
		}

		return promise;
	}
}

function parseVideoIndex (toc, json) {
	let keyOrder = [];
	let root = this.root;

	function prefix(o) {
		o.src = urlJoin(root, o.src);
		o.srcjsonp = urlJoin(root, o.srcjsonp);
		return o;
	}

	function tocOrder(a, b) {
		// Since the <[topic|object] ntiid="..." is not guaranteed to be unique,
		// this will just order by first occurance of any element that has an
		// ntiid attribute with value of what is asked for (a & b)
		let c = toc.getSortPosition(a),
		d = toc.getSortPosition(b),
		p = c > d;
		return p ? 1 : -1;
	}

	let containers = (json && json.Containers) || {};
	let keys = Object.keys(containers);

	try {
		keys.sort(tocOrder);
	} catch (e) {
		console.warn('Potentially unsorted: %o', e.stack || e.message || e);
	}

	keys.forEach(k => keyOrder.push(...containers[k]));

	let vi = (json && json.Items) || json;

	for (let n in vi) {
		if (vi.hasOwnProperty(n)) {
			n = vi[n];
			if (n && !isEmpty(n.transcripts)) {
				n.transcripts = n.transcripts.map(prefix);
			}
		}
	}

	return new VideoIndex(this[Service], this, vi, keyOrder, containers);
}
