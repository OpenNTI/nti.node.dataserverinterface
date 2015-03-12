import QueryString from 'query-string';

import {Parser as parse} from '../../CommonSymbols';

const Service = Symbol.for('Service');

export default {
	getContents (params) {
		let link = this.getLink('contents');
		if (!link) {
			return Promise.reject('No Link!?');
		}

		if (typeof params === 'object') {
			link = link.concat('?',QueryString.stringify(params));
		}

		return this[Service].get(link)
			.then(wrapper =>
				Object.assign(
					wrapper,
					{
						Items: this[parse](wrapper.Items)
					}
				)
			);
	}
};
