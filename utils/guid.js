'use strict';

/**
 * RFC4122 version 4 compliant UUID generator.
 *
 * @see http://stackoverflow.com/a/8809472
 */
module.exports = exports = function guidGenerator() {
	var d = Date.now();
	/* jshint -W016 */
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c==='x' ? r : (r&0x7|0x8)).toString(16);
    });
};
