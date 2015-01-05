'use strict';
var ensureArray = require('./ensure-array');
var et = require('elementtree');

module.exports = function (html, isWidgetCallback) {
	var root = et.parse('<root>'+html+'</root>').getroot();
	var children = processChildren(root, isWidgetCallback);

	/*jshint -W054*/
	return new Function('React, renderWidget',
		'renderWidget = renderWidget || React.createElement.bind(React);' +
		'return ' + reactifyElement('"div"', {}, children)
	);
};


function getLiteral(str) {
	if (typeof str !== 'string') {
		return String(str);
	}

	return '"' + str + '"';
}


function reactifyElement(element, props, children, customFunc) {
	//TODO: translate html attribute names to JS propertyNames

	props = JSON.stringify(props);

	children = ensureArray(children);
	children = children.length > 0 ? children.join(',') : 'undefined';

	var renderer = customFunc || 'React.createElement';

	return renderer + '('+element+', '+props+', '+children+')';
}


function processNode(n, isWidget) {
	var renderFunction;

	if (isWidget){
		if (isWidget(n.tag, n.attrib)) {
			renderFunction = 'renderWidget';
		}
	}

	var el = reactifyElement(
		getLiteral(n.tag),
		n.attrib,
		processChildren(n, isWidget),
		renderFunction);

	var res = [el];

	if (n.tail) {
		res.push(getLiteral(n.tail));
	}

	return res;

}


function processChildren(n, isWidget) {
	var text = n.text && getLiteral(n.text);
	var c = n.getchildren().map(function(x){
		return processNode(x, isWidget);
	});


	if (text) {
		c.unshift(text);
	}

	return c;
}
