
export default function withValue(value, enumerable = false, writable = false) {
	return value && {
		enumerable,
		writable,
		configurable: true,
		value: value
	};
}
