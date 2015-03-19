import hasClass from './dom-hasclass';

export default function addClass  (el, className) {
	if (el.classList) {
		return el.classList.add(className);
	}

	var classes;
	if (!hasClass(el, className)) {
		classes = (el.className || '').split(' ');
		classes.push(className);
		el.className = classes.join(' ');
	}
}
