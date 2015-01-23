'use strict';

var unique = require('../../utils/array-unique');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var forwardFunctions = require('../../utils/function-forwarding');
var parse = require('../../utils/parse-object');

var base = require('../mixins/Base');


function Enrollment(service, data) {
	define(this, {_service: withValue(service)});

	Object.assign(this, data);

	var i = this.CourseInstance = parse(this, data.CourseInstance);

	i.on('changed', this.onChange.bind(this));

	this.__pending = [].concat(i.__pending || []);
}

Object.assign(Enrollment.prototype, base,
	forwardFunctions([
		'getPresentationProperties',
		'getOutline',
		'getDiscussions'

		//From:
	], 'CourseInstance'), {

	isCourse: true,
	isEnrollment: true,


	drop: function () {
		return this._service.delete(this.href);
	},


	getCourseID: function() {
		return this.CourseInstance.getID();
	},


	getStatus: function() {
		return this.LegacyEnrollmentStatus;
	},


	__cleanToCNodes: function(toc, remove) {
		var status = this.LegacyEnrollmentStatus;


		for(let e of toc.findall('*[@visibility]')) {
			if (/everyone/i.test(e.get('visibility'))) {
				continue;
			}

			if (!this.hasVisibility(e, status)) {
				this.__getToCNodesReferencing(e.get('target-ntiid'), toc)
					.forEach(remove);
			}
		}
	},


	__getToCNodesReferencing: function (ntiid, toc) {
		if (!toc || !ntiid) {
			return [];
		}

		function getNodesForKey(keys) {
			var nodes = [];

			for(let k of keys) {
				nodes = unique(nodes.concat(toc.findall('*[@' + k + '="' + ntiid + '"]')));
			}

			return nodes;
		}

		return getNodesForKey(['ntiid', 'target-ntiid']);
	}

});


module.exports = Enrollment;
