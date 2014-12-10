'use strict';

Object.assign(exports, {

	getAssessedRoot: function() {

		var p = this._parent;

		if (!p || !p.getAssessedRoot) {
			return this;
		}

		return p.getAssessedRoot();
	}

});
