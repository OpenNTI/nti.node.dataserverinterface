'use strict';

var args = 'value, index, self';
var filter = new Function(args, 'return self.indexOf(value) === index');
var filterLast = new Function(args, 'return self.lastIndexOf(value) === index');

module.exports = function unique(array, keepLastOccurance) {
    return array.filter(keepLastOccurance ? filterLast : filter);
};
