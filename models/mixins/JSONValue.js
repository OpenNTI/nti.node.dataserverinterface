import isFunction from '../../utils/isfunction';

export default {

	getData () {
		let d = {};

		for (let k of Object.keys(this)) {
			let v = this[k];
			if (v !== void undefined && !isFunction(v)) {

				if (v && isFunction(v.getData)) {
					v = v.getData();
				}

				d[k] = v;
			}
		}

		return d;
	}

};
