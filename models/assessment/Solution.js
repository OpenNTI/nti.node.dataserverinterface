'use strict';

var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');


function Solution(service, parent, data) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent)
	});

	merge(this, data);
}

merge(Solution.prototype, base, {


});


function parse(service, parent, data) {
	return new Solution(service, parent, data);
}

Solution.parse = parse;

module.exports = Solution;
