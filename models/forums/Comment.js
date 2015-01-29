import {Service, Parser as parse} from '../../CommonSymbols';
import Post from './Post';

import QueryString from 'query-string';

export default class Comment extends Post {

	getReplies () {
		var link = this.getLink('replies');
		if (!link) {
			return Promise.resolve([]);
		}

		var params = {
			sortOn: 'CreatedTime',
			sortOrder: 'ascending'
		};

		link = link.concat('?',QueryString.stringify(params));

		return this[Service].get(link)
			.then(result => this[parse](result.Items));
	}
}
