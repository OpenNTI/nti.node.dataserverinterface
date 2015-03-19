/*global Node*/
//Node.TEXT_NODE -- we can't trust the constant to be defined, but we can trust
// the spec's value: 3 === TEXT_NODE
const TEXT_NODE = Node.TEXT_NODE || 3;


export default function isTextNode (node) {
	return node && node.nodeType === TEXT_NODE;
}
