import isElement from './dom-iselement';
import isTextNode from './dom-istextnode';

export default function getTextNodes (root) {
   var textNodes = [];

   function getNodes(node) {
	   var child;

	   if (isTextNode(node)) {
		   textNodes.push(node);
	   }
	   else if (isElement(node)) {
		   for (child = node.firstChild; child; child = child.nextSibling) {
			   getNodes(child);
		   }
	   }
   }

   getNodes(root.body || root);
   return textNodes;
}
