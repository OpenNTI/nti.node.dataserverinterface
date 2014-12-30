'use strict';
var isBrowser = require('./browser');

/* jshint -W101 *//*
 * @credits: http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/4819886#4819886
 */
var isTouchDevice = isBrowser && (
	'ontouchstart' in global || // everyone else
	'onmsgesturechange' in global //IE10
	);

module.exports = isTouchDevice;
