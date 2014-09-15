'use strict';

module.exports = function unique(array) {
    var a = array.slice();
	var i, j;
    for(i = 0; i < a.length; ++i) {
        for(j = i + 1; j < a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};
