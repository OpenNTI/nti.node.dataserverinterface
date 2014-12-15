'use strict';

var Base = require('./Assignment');

//var parser = require('../../utils/parse-object');


function TimedAssignment(service, parent, data) {
	Base.call(this, service, parent, data);

	// IsTimedAssignment
	// MaximumTimeAllowed

	// Metadata {
	//		Duration: int (seconds),
	//		StartTime: int (seconds)
	// }
}


TimedAssignment.prototype = Object.create(Base.prototype);
Object.assign(TimedAssignment.prototype, {
	constructor: TimedAssignment,

	isTimed: true,

	__setup: function (data) {
		Base.prototype.__setup.call(this, data);

		this.MaximumTimeAllowed *= 1000;

		if (this.Metadata) {
			this.Metadata.Duration *= 1000;
			this.Metadata.StartTime *= 1000;
		}
	},


	isOverTime: function () {

	},


	isStarted: function () {
		return !this.getLink('Commence');
	},


	start: function() {
		var me = this;
		var link = this.getLink('Commence');

		if (!link) {
			return Promise.reject('No commence link');
		}

		return this._service.post(link)
			.then(function (data) { me.__setup(data); });
	},


	getDuration: function() {
		var md = this.Metadata;
		return md && md.Duration;
	},


	getStartTime: function() {
		var md = this.Metadata;
		return md && md.StartTime;
	},


	getMaximumTimeAllowed: function () {
		return this.MaximumTimeAllowed;
	},


	getTimeRemaining: function() {
		var now = new Date().getTime();
		var max = this.getMaximumTimeAllowed();
		var start = this.getStartTime();

		return  !start ?
					max :
					(max - (now - start));
	}


});

function parse(service, parent, data) {
	return new TimedAssignment(service, parent, data);
}

TimedAssignment.parse = parse;

module.exports = TimedAssignment;
