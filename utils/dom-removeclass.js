import hasClass from './dom-hasclass';

export default function removeClass  (el, className) {
	if (el.classList) {
		return el.classList.remove(className);
	}

	var classes;
	if (hasClass(el, className)) {
		classes = (el.className || '').split(' ');
		classes.splice(classes.indexOf(className), 1);
		el.className = classes.join(' ');
	}
}
