/*global Node*/
//Node.ELEMENT_NODE -- we can't trust the constant to be defined, but we can trust
// the spec's value: 1 === ELEMENT_NODE
const ELEMENT_NODE = Node.ELEMENT_NODE || 3;


export default function isElementNode (node) {
	return node && node.nodeType === ELEMENT_NODE;
}
