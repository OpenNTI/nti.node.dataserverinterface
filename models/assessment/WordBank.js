import Base from '../Base';
import {Parser as parse} from '../../CommonSymbols';

export default class WordBank extends Base {
	constructor(service, parent, data) {
		super(service, parent, data);
		this.entries = data.entries.map(e=>this[parse](e));
	}

	getEntry (id) {
		return this.entries.reduce((found, x) => found || (x.wid === id && x), null);
	}

}
