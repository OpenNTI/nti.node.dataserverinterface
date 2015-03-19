/*global Node*/
import isEmpty from './isempty';

import isTextNode from './dom-isTextNode';

import matches from './dom-matches';

//some browsers do not define these constants.
const ELEMENT_NODE = Node.ELEMENT_NODE || 1;


export default function parent(el, selector) {
	if (isTextNode(el)) {
		el = el.parentNode;
	}

	if (el && !isEmpty(selector)) {
		while(el.parentNode && !matches(el, selector)) {
			el = el.parentNode;
		}
	}

	//this will return null for any node/falsy value of el where el's NodeType
	// is not an Element.
	return (el && el.nodeType === ELEMENT_NODE && el) || null;

}
