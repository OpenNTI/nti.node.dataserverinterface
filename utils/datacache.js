'use strict';

var globalKey = '%%app-data%%';

function DataCache() {
	this.data = global[globalKey] || {};
	delete global[globalKey];
	//console.warn('Constructing new DataCache instance', this);
}


DataCache.prototype.get = function(key) {
	return this.data[key];
};


DataCache.prototype.set = function(key, value) {
	var o;
	if (typeof key === 'object') {
		o = key;
		for (key in o) {
			if (o.hasOwnProperty(key)) {
				this.set(key, o[key]);
			}
		}
		return;
	}

	//throw if it can't be serialized, and ensure we have our own clone.
	this.data[key] = JSON.parse(JSON.stringify(value));
	return this;
};


DataCache.prototype.serialize = function ToScriptTag() {
	return '\n<script type="text/javascript">\n' +
			'window["' + globalKey + '"] = ' + JSON.stringify(this.data) +
			';\n</script>\n';
};


module.exports = new DataCache();
