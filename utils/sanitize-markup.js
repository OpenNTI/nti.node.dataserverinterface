'use strict';

var isEmpty = require('./isempty');

var anchors = /<a([^>]*)>(.*?)<\/a>/igm;
var pars = /<(\/)?p([^>]*)>/igm;

function stripAnchors(tag, attrs, body) {
	return (isEmpty(body) || isEmpty(attrs) || attrs.indexOf('href') === -1) ? '' : tag;
}

function stripPars(tag, end) {
	return end ? '\n' : '';
}

module.exports = function (string) {

	string = string && string.replace(anchors, stripAnchors);
	string = string && string.replace(pars, stripPars);

	return string.trim();
};
