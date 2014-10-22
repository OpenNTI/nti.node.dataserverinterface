'use strict';

var merge = require('merge');
var unique = require('../../utils/array-unique');
var urlJoin = require('../../utils/urljoin');
var withValue = require('../../utils/object-attribute-withvalue');
var forwardFunctions = require('../../utils/function-forwarding');
var base = require('../mixins/Base');

var Instance = require('./Instance');

function Enrollment(service, data, admin) {
	Object.defineProperty(this, '_service', withValue(service));

	merge(this, data);

	var i = this.CourseInstance = Instance.parse(service, this, data.CourseInstance);

	i.on('changed', this.onChange.bind(this));

	this.__pending = [].concat(i.__pending || []);
}

merge(Enrollment.prototype, base,
	forwardFunctions([
		'getPresentationProperties',
		'getOutline'

		//From:
	], 'CourseInstance'), {

	isCourse: true,
	isEnrollment: true,


	getCourseID: function() {
		return this.CourseInstance.getID();
	},


	getStatus: function() {
		return this.LegacyEnrollmentStatus;
	},


	__cleanToCNodes: function(toc, remove) {
		var status = this.LegacyEnrollmentStatus;


		toc.findall('*[@visibility]')
			.forEach(function (e) {
				if (/everyone/i.test(e.get('visibility'))) {
					return;
				}

				if (!this.hasVisibility(e, status)) {
					this.__getToCNodesReferencing(e.get('target-ntiid'), toc)
						.forEach(remove);
				}
			}.bind(this));
	},


	__getToCNodesReferencing: function (ntiid, toc) {
		if (!toc || !ntiid) {
			return [];
		}

		function getNodesForKey(keys) {
			var nodes = [];

			keys.forEach(function(k) {
				nodes = unique(nodes.concat(toc.findall('*[@' + k + '="' + ntiid + '"]')));
			});

			return nodes;
		}

		return getNodesForKey(['ntiid', 'target-ntiid']);
	}

});



function parse(service, data, admin) {
	return new Enrollment(service, data, admin);
}

Enrollment.parse = parse;

module.exports = Enrollment;
