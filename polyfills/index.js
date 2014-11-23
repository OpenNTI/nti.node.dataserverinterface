'use strict';

function applyIf(dest, src) {
	for(var i in src) {
		if (src.hasOwnProperty(i)) {
			if (!dest.hasOwnProperty(i)) {
				dest = src[i];
			}
		}
	}
}

var noop = function() {};

if (!global.console) {
	global.console = { log: noop };
}

applyIf(console, {
	debug: console.log,
	info: console.log,
	warn: console.log,
	error: console.log,
	group: noop,
	trace: noop,
	groupCollapsed: noop,
	groupEnd: noop,
	time: noop,
	timeEnd: noop
});


if (!global.Promise) {
	global.Promise = require('es6-promise').Promise;
}


if (!Object.assign) {
	Object.assign = require('object-assign');
}
