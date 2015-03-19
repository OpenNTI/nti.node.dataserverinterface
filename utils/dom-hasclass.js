
export default function hasClass (el, className) {
	var classes = (el.className || '').split(' ');
	return classes.indexOf(className) !== -1;
}
