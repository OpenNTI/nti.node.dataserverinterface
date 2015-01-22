
function getParser() {
	//because Parser requires all models, we can't put this ref
	//at the top... build will fail. So we will pull the ref on demand
	if(!getParser.parser) {
		getParser.parser = require('../models/Parser');
	}
	return getParser.parser;
}


const Service = Symbol.for('Service');


export default function parseObject(parent, data) {
	let parser = getParser();
	let service = parent[Service] || parent._service;

	try {
		return data && parser(service, parent, data);
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
