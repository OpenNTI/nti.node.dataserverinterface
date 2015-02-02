import Base from './Base';
import {Parser} from '../CommonSymbols';

export default class Change extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
		this.Item = this[Parser](this, data.Item);
	}

}
