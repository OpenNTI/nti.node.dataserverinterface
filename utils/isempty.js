module.exports.isEmpty = function isEmpty(value) {
    return	(value === null) ||
			(value === undefined) ||
			(Array.isArray(value) && value.length === 0);
}
