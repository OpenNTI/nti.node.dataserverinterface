import Session from './session';
import Interface from './interface';
import cache from './utils/datacache';

import {getModelByType as lookup} from './models/Parser';

export default function(config) {
	var i = new Interface(config);

	return {
		datacache: cache,
		interface: i,
		session: new Session(i)
	};
}

export function getModel (...args) {
	return lookup(...args);
}
