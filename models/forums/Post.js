import Base from '../Base';
import {Service, Parser as parse} from '../../CommonSymbols';
//import SharedWithList from '../mixins/SharedWithList';

export default class Post extends Base {
	constructor (service, parent, data) {
		super(service, parent, data/*, SharedWithList*/);

		//body
		//title
	}

	setProperties(newProps) {
		const link = this.getLink('edit');
		var props = {};

		if (!link) {
			throw new Error('Post is not editable. (No edit link).');
		}

		// only allow specific properties to be updated.
		for (let propName of ['body', 'title', 'tags']) {
			if (newProps[propName]) {
				props[propName] = newProps[propName];
			}
		}


		return this[Service].put(link, props)
			// assimilate the resultant instance's properties. the current instance could be
			// referenced by another object (this could be a topic headline post referenced
			// by its parent topic, for example) so we want the current instance to reflect
			// the changes.
			.then(result => {
				if (this === global) {
					console.warn('wtf?');
				}
				let parent = this.parent();
				let actingParent = (parent && parent[parse]) ? parent : this;

				let o = actingParent[parse](result);
				return Object.assign(this, o);
			});
	}
}
