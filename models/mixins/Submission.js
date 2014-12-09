'use strict';

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var parser = require('../../utils/parse-object');

exports = module.exports = {


	canSubmit: function() {
		if (this.isSubmitted()) {return false;}

		var list = this.questions || this.parts || [];

		return list.reduce(function(can, q) {
			return can || q.canSubmit(); }, false);
	},


	isSubmitted: function () {
		var p;

		//Test if we are explicitly marked submitted
		return Boolean(this.__submitted ||

			//Then check parent for submitted
			((p = this.up('isSubmitted')) && p.isSubmitted()));

	},


	markSubmitted: function (v) {
		delete this.__submitted;
		define(this, {
			__submitted: withValue(!!v)
		});
	},


	submit: function() {
		var me = this;
		var target = (this._service.getCollectionFor(me) || {}).href;
		if (!target) {
			console.error('No where to save object: %o', this);
		}

		return me._service.post(target, me.getData())
			.then(function (data) { return parser(me, data); });
	}
};
