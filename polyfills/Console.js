'use strict';

function applyIf(dest, src) {
	for(var i in src) {
		if (src.hasOwnProperty(i)) {
			if (!dest[i]) {
				dest = src[i];
			}
		}
	}
}

function noop() {}

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
