'use strict';

var stringHash = require('./string-hash');

var externalUriRegex = /^((\/\/)|([a-z][a-z0-9\+\-\.]*):)/i;


function bustCorsForResources(string, name, value) {
	//Look for things we know come out of a different domain
	//and append a query param.  This allows us to, for example,
	//add a query param related to our location host so that
	//we can tell amazon's caching servers to take that into consideration

	//We are looking for an attribute whose valus is a quoted string
	//referenceing resources.  We ignore urls with a protocol or protcolless
	//absolute urls (//).  We look for relative urls rooted at resources.
	//or absolute urls whose first folder is resources.
	//TODO Processing html with a regex is stupid
	//consider parsing and using selectors here instead.  Note
	//we omit things that contain query strings here
	var regex = /(\S+)\s*=\s*"(((\/[^"\/]+\/)||\/)resources\/[^?"]*?)"/igm;

	function cleanup(original, attr, url) {
		return attr + '="' + url + '?' + name + '=' + value + '"';
	}

	return string.replace(regex, cleanup);
}


function rebase(string, basePath) {
	var location = global.location || {};//This will not work well on server-side render

	function fixReferences(original, attr, url) {
		var firstChar = url.charAt(0),
			absolute = firstChar === '/',
			anchor = firstChar === '#',
			external = externalUriRegex.test(url),
			host = absolute ? '' : basePath,
			params;

		if (/src/i.test(attr) && /youtube/i.test(url)) {
			params = [
				'html5=1',
				'enablejsapi=1',
				'autohide=1',
				'modestbranding=1',
				'rel=0',
				'showinfo=0',
				'wmode=opaque',
				'origin=' + encodeURIComponent(location.protocol + '//' + location.host)];

			url = url.replace(/http:/i, 'https:').replace(/\?.*/i, '');

			return ['src="', url, '?', params.join('&'), '"'].join();
		}

		//inline
		return (anchor || external || /^data:/i.test(url)) ?
			original : attr + '="' + host + url + '"';
	}

	var envSalt = '',
		locationHash = stringHash(location.hostname + envSalt);

	string = bustCorsForResources(string, 'h', locationHash);
	string = string.replace(/(src|href|poster)="(.*?)"/igm, fixReferences);
	return string;
}

rebase.bustCorsForResources = bustCorsForResources;

module.exports = exports = rebase;
