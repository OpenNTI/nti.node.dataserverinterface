'use strict';

var applyIf = require('../utils/applyif');
var noop = require('../utils/empty-function');
var con = global.console || (global.console = { log: noop });

applyIf(con, {
	debug: con.log,
	info: con.log,
	warn: con.log,
	error: con.log,
	group: noop,
	trace: noop,
	groupCollapsed: noop,
	groupEnd: noop,
	time: noop,
	timeEnd: noop
});
