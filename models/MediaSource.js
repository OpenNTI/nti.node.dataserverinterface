import Base from './Base';

import MetaDataResolver from './MetaDataResolver';

export default class MediaSource extends Base{
	constructor(service, parent, data) {
		super(service, parent, data);
	}


	getPoster () {
		return this.poster ?
			Promise.resolve(this.poster) :
			MetaDataResolver.from(this)
				.then(meta=>meta.poster);

	}
}
