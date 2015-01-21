'use strict';
var ensureArray = require('./ensure-array');
var et = require('elementtree');

var UNARY_ELEMENTS = [
	'br',
	'img'
];

module.exports = function (html, isWidgetCallback) {
	var xml = ensureUnaryTagsAreClosedXML(html);

	var root = et.parse('<root>'+xml+'</root>').getroot();
	var children = processChildren(root, isWidgetCallback);

	var out = 'return ' + reactifyElement('"div"', {}, children);
	/*jshint -W054*///Not evil in this case. Building a Template function.
	return new Function(
		'React, renderWidget', //arguments
		'renderWidget = renderWidget || React.createElement.bind(React);' + out // function body
		);
};


function getLiteral(str) {
	if (typeof str !== 'string') {
		return String(str);
	}

	str = str
		.replace(/"/g, '\\"') //escape double quotes
		.replace(/\n/g, '\\n')//escape new lines
		.replace(/\r/g, '\\r');//escape carage returns

	return '"' + str + '"';
}


function reactifyElement(element, props, children, customFunc) {
	//TODO: translate html attribute names to JS propertyNames

	delete props.style; // TODO: convert styles to react
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


function ensureUnaryTagsAreClosedXML(html) {
	var output = html;

	function getMatcher(tag) {
		var c = getMatcher,
			m = c[tag] || (c[tag] = new RegExp('(<'+tag+')([^>]*)(>)', 'igm'));
		return m;
	}

	function fix(o, tag, attrs, closer) {
		if (attrs.length === 0 || attrs.charAt(attrs.length-1) !== '/') {
			return tag + attrs + '/' + closer;
		}
		return o;
	}

	for(let tagName of UNARY_ELEMENTS) {
		output = output.replace(getMatcher(tagName), fix);
	}

	return output;
}
