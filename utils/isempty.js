module.exports = function isEmpty(value) {
    return	(value === null) ||
			(value === undefined) ||
			(Array.isArray(value) && value.length === 0);
}
