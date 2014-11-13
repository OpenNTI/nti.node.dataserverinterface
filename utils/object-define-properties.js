'use strict';

module.exports = function defineProperties(obj, props) {
	var hasDefineProp = Boolean(Object.defineProperty),
		cfg, getter, setter, property,
		empty = function() {},
		val = function(v) {return function(){return v;};};

	for (property in props) {
		if (props.hasOwnProperty(property)) {
			cfg = props[property];
			if (!cfg) {continue;}

			if (hasDefineProp) {
				/*jshint -W103*/
				cfg.__proto__ = null;
				Object.defineProperty(obj, property, cfg);
			}
			else {
				getter = cfg.get || cfg.hasOwnProperty('value') ? val(cfg.value) : empty;
				setter = cfg.set || empty;

				obj.__defineSetter__(property, setter);
				obj.__defineGetter__(property, getter);
			}
		}
	}
};
