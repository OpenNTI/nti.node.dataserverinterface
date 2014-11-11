'use strict';

var isEmpty = require('./isempty');

var anchors = /<a([^>]*)>(.*?)<\/a>/igm;

function stripAnchors(tag, attrs, body) {
	return (isEmpty(body) || isEmpty(attrs) || attrs.indexOf('href') === -1) ? '' : tag;
}

module.exports = function (string) {

	string = string && string.replace(anchors, stripAnchors);

	return string;
};
