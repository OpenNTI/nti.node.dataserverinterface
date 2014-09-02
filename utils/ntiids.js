'use strict';
var isEmpty = require('./isempty');
var defineAttributes = require('./object-define-attributes');

/**
 * Parses an id and returns an object containing the split portions
 * See http://excelsior.nextthought.com/server-docs/ntiid-structure/

 * @param {String} id
 * @return {Object} an object containing the components of the id
 */
function parseNTIID(id) {
	var parts = (typeof id !== 'string' ? (id || '').toString() : id).split(':'),
		authority, specific,
		result = {};

	if (parts.length < 3 || parts[0] !== 'tag') {
		//console.warn('"'+id+'" is not an NTIID');
		return null;
	}

	//First part is tag, second is authority, third is specific portion

	//authority gets split by comma into name and date
	authority = parts[1].split(',');
	if (authority.length !== 2) {
		//invalid authority chunk
		return null;
	}

	result.authority = {
		name: authority[0],
		date: authority[1]
	};

	//join any parts after the 2nd into the specific portion that will
	//then be split back out into the specific parts.
	//TODO yank the fragment off the end
	specific = parts.slice(2).join(':');
	specific = specific.split('-');

	result.specific = {
		type: specific.length === 3 ? specific[1] : specific[0],
		typeSpecific: specific.length === 3 ? specific[2] : specific[1]
	};

	//Define a setter on provider property so we can match the ds escaping of '-' to '_'
	defineAttributes(result.specific, {
		provider: {
			getter: function() {return this.$$provider;},
			setter: function(p) {
				if (p && p.replace) {
					p = p.replace(/-/g, '_');
				}
				this.$$provider = p;
			}
		}
	});

	result.specific.provider = specific.length === 3 ? specific[0] : null;

	result.toString = function() {
		var m = this,
			a = [
				m.authority.name,
				m.authority.date
			],
			s = [
				m.specific.provider,
				m.specific.type,
				m.specific.typeSpecific
			];
		if (!m.specific.provider) {
			s.splice(0, 1);
		}

		return ['tag', a.join(','), s.join('-')].join(':');
	};

	//FIXME include authority?
	result.toURLSuffix = function() {
		//#!html/mathcounts/mathcounts2013.warm_up_7
		var m = this, components = [];

		components.push(m.specific.type);
		if (m.specific.provider) {
			components.push(m.specific.provider);
		}
		components.push(m.specific.typeSpecific);

		return '#!' + components.map(encodeURIComponent).join('/');
	};

	return result;
}


function isNTIID(id) {
	return Boolean(parseNTIID(id));
}


/**
 * CSS escape ids
 * @param {string} id
 * @return {string} CSS-friendly string to use in a selector
 */
function escapeId(id) {
	return id.replace(/:/g, '\\3a ') //no colons
			.replace(/,/g, '\\2c ')//no commas
			.replace(/\./g, '\\2e ');//no periods
}


/**
 * Returns the prefix of the content ntiid we think this ntiid would reside beneath
 * @param {String} id
 * @return {String}
 */
function ntiidPrefix(id) {
	var ntiid = parseNTIID(id);
	if (ntiid) {
		ntiid.specific.type = 'HTML';
		ntiid.specific.typeSpecific = ntiid.specific.typeSpecific.split('.').first();
	}
	return ntiid && ntiid.toString();
}


/**
 * Parse the "URL friendly" NTIID we made for the legacy webapp.
 */
function parseFragment(fragment) {
	var authority = 'nextthought.com,2011-10',
		parts, type, provider, typeSpecific, s;

	if (isEmpty(fragment) || fragment.indexOf('#!') !== 0) {
		return null;
	}
	fragment = fragment.slice(2);
	parts = fragment.split('/');
	if (parts.length < 2 || parts.length > 3) {
		return null;
	}

	type = parts[0];
	provider = parts.length === 3 ? parts[1] : '';
	typeSpecific = parts.length === 3 ? parts[2] : parts[1];

	s = [provider, type, typeSpecific].map(decodeURIComponent);
	if (isEmpty(provider)) {
		s.splice(0, 1);
	}

	return ['tag', authority, s.join('-')].join(':');
}


module.exports = {
	parseNTIID: parseNTIID,
	isNTIID: isNTIID,
	escapeId: escapeId,
	ntiidPrefix: ntiidPrefix,
	parseFragment: parseFragment
};
