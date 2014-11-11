'use strict';

var assign = require('object-assign');

function Task(fn, interval) {
	this.fn = fn;
	this.interval = interval || 1000;
}

assign(Task.prototype, {
	start: function () {
		if (this._id) {
			return;
		}
		this._id = setInterval(this.fn, this.interval);
	},


	stop: function () {
		clearInterval(this._id);
		delete this._id;
	}
});


module.exports = Task;
