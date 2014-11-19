'use strict';


//var isBrowser = require('../../utils/browser');
var urlJoin = require('../../utils/urljoin');
var isEmpty = require('../../utils/isempty');
//var isThenable = require('../../utils/isthenable');

var ASSET_MAP = {
	thumb: 'contentpackage-thumb-60x60.png',
	landing: 'contentpackage-landing-232x170.png',
	background: 'background.png'
};

var MISSING_ASSET_DATA = {};

/**
 * return the root that should be used if PlatforPresentationResources isn't defined
 * @return {string} default root to use
 */
function getDefaultAssetRoot(scope) {
	if (typeof window !== 'undefined') {
		/* global window */
		window.__MISSING_ASSET_DATA = MISSING_ASSET_DATA;
	}

	MISSING_ASSET_DATA[scope.getID()] = true;

	if (scope.getDefaultAssetRoot) {
		return scope.getDefaultAssetRoot();
	}

	console.warn('Missing implementation of "getDefaultAssetRoot" in', scope);
	return '';
}

Object.assign(exports, {


	getAssetRoot: function getAssetRoot() {
		if (this.presentationroot) { return this.presentationroot; }

		var resources = this.PlatformPresentationResources || [],
			root;

		resources.every(function(resource) {
			if (resource.PlatformName === 'webapp') {
				root = resource.href;
			}
			return !root;
		});

		this.presentationroot = root || getDefaultAssetRoot(this);

		return this.presentationroot;
	},


	/**
	 * builds the url for the asset and returns a promise that fulfills if the img loads or rejects if it fails.
	 * @param  {string} name asset name to load
	 * @return {Promise} whether or not the asset exists
	 */
	getAsset: function getAsset(name) {
		var assetPath = ASSET_MAP[name] || ('missing-' + name + '-asset.png'),
			root = this.getAssetRoot(),
			url = root && urlJoin(root, assetPath);
			// cache = this._service.getDataCache(),
			// cacheKey = 'asset-' + url;

		if (isEmpty(root)) {
			return Promise.reject('No root');
		}

		return Promise.resolve(url);
		// var p = cache.get(cacheKey);
		// if (p === undefined) {
		// 	p = this._service.head(url)
		// 		.then(
		// 			function() {
		// 				cache.set(cacheKey, true);
		// 			},
		// 			function(r) {
		// 				cache.set(cacheKey, false);
		// 				return Promise.reject(r);
		// 			});
		// 	cache.setVolatile(cacheKey, p);
		// } else {
		//
		// 	if (isThenable(p)) {
		// 		p = Promise.resolve(p);
		// 	} else {
		// 		p = Promise[p ? 'resolve' : 'reject']();
		// 	}
		// }
		//
		// return p
		// 	.then(
		// 		function() { return url; },
		// 		function() { return Promise.reject(name + ' asset not found'); });
	}

});
