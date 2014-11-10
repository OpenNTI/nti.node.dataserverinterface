'use strict';

var assign = require('../../../utils/assign');
var Base = require('../Part');

var isEmpty = require('../../../utils/isempty');

function File(service, parent, data) {
	Base.call(this, service, parent, data);
}


File.prototype = Object.create(Base.prototype);
assign(File.prototype, {
	constructor: File,


	isFileAcceptable: function(file) {
		var name = this.__checkExt(file.name),
			type = this.__checkMime(file.type),
			size = this.__checkSize(file.size),
			r = this.reasons = [];

		if (!name) {
			r.push('Name does not have an acceptible extention: ' + this.allowed_extentions.join(', '));
		}

		if (!type) {
			r.push('The file is of a type we do not allow.');
		}

		if (!size) {
			r.push('The file is too large.');
		}

		return name && type && size;
	},


	__getRegExp: function(pattern, regExpFormat) {
		var o = RegExp.escape(pattern)
				.replace(/\\\*/g, '[^/]+');
		return new RegExp((regExpFormat || '^{0}$').replace('{0}', o));
	},


	__checkMime: function(mime) {
		var me = this,
			allowedMimes = this.allowed_mime_types || ['*/*'];

		if (isEmpty(mime)) {
			mime = '-/-';
		}

		return allowedMimes.some(function(o) {
			return me.__getRegExp(o).test(mime);
		});
	},


	__checkExt: function(name) {
		var me = this,
			allowedNames = this.allowed_extentions || ['*.*'];
		return allowedNames.some(function(o) {
			return me.__getRegExp(o, '{0}$').test(name);
		});
	},


	__checkSize: function(size) {
		var max = this.max_file_size || Infinity;
		return size < max && size > 0;
	}

});


function parse(service, parent, data) {
	return new File(service, parent, data);
}


File.parse = parse;


module.exports = File;
