
export default {

	getAssessedRoot () {

		var p = this.parent();

		if (!p || !p.getAssessedRoot) {
			return this;
		}

		return p.getAssessedRoot();
	}

};
