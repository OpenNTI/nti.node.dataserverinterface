'use strict';

var merge = require('merge');
var isBrowser = require('../../../utils/browser');
var urlJoin = require('../../../utils/urljoin');
var isEmpty = require('../../../utils/isempty');

var ASSET_MAP = {
	thumb: 'contentpackage-thumb-60x60.png',
	landing: 'contentpackage-landing-232x170.png',
	background: 'background.png'
};


/**
 * return the root that should be used if PlatforPresentationResources isn't defined
 * @return {string} default root to use
 */
function getDefaultAssetRoot(scope) {
	if (scope.getDefaultAssetRoot) {
		return scope.getDefaultAssetRoot();
	}

	console.warn('Missing implementation of "getDefaultAssetRoot" in', scope);
	return '';
}


function getAssetRoot() {
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
}


/**
 * builds the url for the asset and returns a promise that fulfills if the img loads or rejects if it fails.
 * @param  {string} name asset name to load
 * @return {Promise} whether or not the asset exists
 */
function getAsset(name) {
	var assetPath = ASSET_MAP[name] || ('missing-' + name + '-asset.png'),
		root = this.getAssetRoot(),
		url = root && urlJoin(root, assetPath);

	if (isEmpty(root)) {
		return Promise.reject('No root');
	}
console.log(url);
	return this._server._request({ method: 'HEAD', url: url })
		.then(
			function() { return url; },
			function() { return Promise.reject(name + ' asset not found'); });
}


merge(exports, {
	getAsset: getAsset,
	getAssetRoot: getAssetRoot
});
