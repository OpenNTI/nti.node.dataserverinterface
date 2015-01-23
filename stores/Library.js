'use strict';


var EventEmitter = require('events').EventEmitter;

var define = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');
var identity = require('../utils/identity');
var waitFor = require('../utils/waitfor');
var unique = require('../utils/array-unique');

var parse = require('../models/Parser');

var instances = {};

function Library(service, name, contentPackages,
								contentBundles,
								enrolledCourses,
								administeredCourses) {

	define(this, {
		_service: withValue(service),
		_name: withValue(name)
	});

	this.onChange = this.onChange.bind(this);

	var pending = this.__pending = [];

	function queue(p) {
		var list = (p && p.__pending) || [];
		return pending.push( ...list) && p;
	}

	var parseList = list=> {
		return list.map(o=> {
			try {
				o = queue(parse(service, null, o));
				if(o && o.on){
					o.on('changed', this.onChange);
				}
			} catch(e) {
				console.error(e.stack || e.message || e);
				o = null;
			}

			return o;
		})
		.filter(identity);
	};

	contentBundles = contentBundles.filter(o => {
		let invalid = !o.ContentPackages || !o.ContentPackages.length;
		if (invalid) {
			console.warn('%o Bundle is empty. Missing packages.', o);
		}
		return !invalid;
	});

	contentPackages = contentPackages.filter(pkg => !pkg.isCourse);


	this.packages = parseList(contentPackages);
	this.bundles = parseList(contentBundles);
	this.courses = parseList(enrolledCourses);
	this.coursesAdmin = parseList(administeredCourses);
}


Object.assign(Library.prototype, EventEmitter.prototype, {

	onChange: function() {
		this.emit('changed', this);
	},


	getCourse: function(courseInstanceId) {
		var courses = [].concat(this.coursesAdmin || []).concat(this.courses || []);
		var found;
		courses.every(function(course) {
			if (course.getCourseID() === courseInstanceId) {
				found = course;
			}

			return !found;
		});

		return found;
	},


	getPackage: function(packageId) {

		var packs = unique(this.packages.concat(

			this.bundles.concat(
					this.courses.concat(this.coursesAdmin).map(function(course) {
						return course.CourseInstance.ContentPackageBundle;}))

				.reduce(function(set, bundle) {
					return set.concat(bundle.ContentPackages); }, [])
			));

		function exact(found, pkg) {
			return found || pkg.getID() === packageId && pkg; }

		return packs.reduce(exact, null);
	}
});


function resolveCollection(s, url, ignoreCache) {
	var cache = s.getDataCache();

	if (!url) {
		return Promise.resolve([]);
	}

	var cached = cache.get(url), result;
	if (!cached || ignoreCache) {
		result = s.get(url)
			.catch(function empty () { return {titles: [], Items: []}; })
			.then(function(data) {
				cache.set(url, data);
				return data;
			});
	} else {
		result = Promise.resolve(cached);
	}

	return result.then(function(data) {
		return data.titles || data.Items;
	});
}


Library.load = function(service, name, reload) {
	function make (contentPackages, contentBundles, enrolledCourses, administeredCourses) {
		return new Library(service, name, contentPackages, contentBundles, enrolledCourses, administeredCourses);
	}

	var instance = instances[name];

	return (instances[name] = Promise.all([
		resolveCollection(service, service.getContentPackagesURL(), reload),
		resolveCollection(service, service.getContentBundlesURL(), reload),
		resolveCollection(service, service.getCoursesEnrolledURL(), reload),
		resolveCollection(service, service.getCoursesAdministeringURL(), reload)
	])
	.then(data=>waitFor((instance = make(...data)).__pending))
	.then(()=>instances[name] = instance))
	.catch(e=> {
		console.error(e.stack||e.message||e);
		return Promise.reject(e);
	});
};


Library.get = function (service, name, reload) {
	function reloading(i) { i.emit('reloading'); }

	var instance = instances[name];

	if (instance) {
		if (!reload) {
			return instance.then ? instance : Promise.resolve(instance);
		}
		else if(instance.then) {
			instance.then(reloading);
		} else {
			reloading(instance);
		}
	}

	return this.load(service, name, reload);
};


// Library.free = function (name) {
// 	//TODO: Implement cleanup.
// };

module.exports = Library;
