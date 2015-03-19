
export default function remove(node) {
	if (node.remove) {
		return node.remove();
	}

	let {parentNode} = node;
	if (parentNode) {
		parentNode.removeChild(node);
	}
}
