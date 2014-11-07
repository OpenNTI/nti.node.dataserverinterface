'use strict';

var parser = null;

module.exports = function parseObject(parent, data) {
	//because Parser requires this model (PageInfo), we can't put this ref
	//at the top... build will fail. So we will pull the ref on demand
	if(!parser) {
		parser = require('../models/Parser');
	}
	try {
		return parser(parent._service, parent, data);
	} catch (e) {
		console.warn(e.stack || e.message || e);
		return data;
	}
};
