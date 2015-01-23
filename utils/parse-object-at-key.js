import parseObject from './parse-object';

export var parser = parseObject;

export default function parseKey(object, key) {
	var value = object[key];

	value = object[key] = parser(object, value);

	if (!value || value.length === 0) {
		delete object[key];
	}

	return value;
}
