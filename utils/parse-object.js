'use strict';

var parser = null;

module.exports = function parseObject(parent, data) {
	var m;

	//because Parser requires this model (PageInfo), we can't put this ref
	//at the top... build will fail. So we will pull the ref on demand
	if(!parser) {
		parser = require('../models/Parser');
	}
	try {
		return data && parser(parent._service, parent, data);
	} catch (e) {
		m = e;
		if (e.NoParser) {
			m = e.message;
		}
		console.warn(m.stack || m.message || m);
		return data;
	}
};
