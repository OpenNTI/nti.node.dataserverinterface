
function getParser() {
	//because Parser requires this model (PageInfo), we can't put this ref
	//at the top... build will fail. So we will pull the ref on demand
	if(!getParser.parser) {
		getParser.parser = require('../models/Parser');
	}
	return getParser.parser;
}


export default function parseObject(parent, data) {
	let parser = getParser();

	try {
		return data && parser(parent._service, parent, data);
	} catch (e) {
		let m = e;
		if (e.NoParser) {
			m = e.message;
		}
		console.warn(m.stack || m.message || m);
		return data;
	}
}


export function getModel(type) {
	let repository = getParser();

	return repository.getModelByType(type);
}
