'use strict';

var assign = require('../../utils/assign');

var SECTION_TYPE_MAP = {
	'application/vnd.nextthought.ntivideo': 'video',
	'application/vnd.nextthought.content': 'additional',
	'application/vnd.nextthought.discussion': 'discussions',
	'application/vnd.nextthought.externallink': 'additional',
	'application/vnd.nextthought.naquestionset': 'assessments',
	'application/vnd.nextthought.assignment': 'assignments',
	'application/vnd.nextthought.nanosubmitassignment': 'assignments'
};

var SECTION_TITLE_MAP = {
	'video': 'Video',
	'discussions': 'Discussions',
	'additional': 'Additional Resources',
	'required': 'Required Resources',
	'assessments': 'Practice Questions',
	'assignments': 'Assignments'
};


var SECTION_COLOR_MAP = {
	'video': '81c8dc',
	'discussions': 'f5d420',
	'additional': 'ce78e0',
	'required': 'f9824e',
	'assessments': 'a5c959',
	'assignments': '7b8cdf',
	'session-overview': 'f9824e'
};

var SHARED = {};

var MIME_PARSER = {
	'application/vnd.nextthought.ntivideo': getVideoProps,
	'application/vnd.nextthought.discussion': getForumProps,
	'application/vnd.nextthought.content': getRelatedWorkProps,
	'application/vnd.nextthought.externallink': getRelatedWorkProps,
	'application/vnd.nextthought.relatedworkref': getRelatedWorkProps,
	//'application/vnd.nextthought.naquestionset': getAssessment,
	'application/vnd.nextthought.naquestionset': getAssessment,
	'application/vnd.nextthought.nanosubmitassignment': getAssessment
};


function noOp() { return SHARED; }


function getForumProps(node) {
	return {
		title: node.get('title'),
		icon: node.get('icon')
	}; }


function getVideoProps(node) {
	return { poster: node.get('poster') }; }


function getRelatedWorkProps(node) {
	return {
		MimeType: 'application/vnd.nextthought.relatedworkref',
		creator: node.get('creator'),
		desc: node.get('desc'),
		href: node.get('href'),
		icon: node.get('icon'),
		'target-NTIID': node.get('target-ntiid'),
		targetMimeType: node.get('type')
	};
}


function getAssessment(node, fallbackMime, outlineNode) {
	var ntiid = node.get('target-ntiid');
	var assignment = outlineNode.getAssignment(ntiid);

	return {
		MimeType: assignment ? 'application/vnd.nextthought.assignment' : fallbackMime,
		'question-count': node.get('question-count'),
		'Target-NTIID': ntiid
	};
}


function notAThing(node) {
	var ignored = {
		'application/vnd.nextthought.ntislidedeck': 1,
		'application/vnd.nextthought.relatedworkref': 1
	};

	return	node.get('suppressed') === 'true' ||
			//extra tag...no data in it.
			(/^object$/i.test(node.tag) && ignored[node.get('mimeType')]);
}


function getConfigForNode(node, outlineNode) {
	if (notAThing(node)) {
		return;
	}

	var obj = {
		MimeType: node.get('mimeType') || node.get('type'),
		NTIID: node.get('ntiid'),
		visibility: node.get('visibility') || 'everyone',
		label: node.get('label'),
		section: node.get('section')
	};

	var parser = MIME_PARSER[obj.MimeType] || noOp;

	return assign(obj, parser(node, obj.MimeType, outlineNode));
}


module.exports = function buildFromToc (element, outlineNode) {
	var sections = {},
		items = [];

	element.getchildren().forEach(function(node) {
		var obj = getConfigForNode(node, outlineNode);
		var type = obj && (obj.section || SECTION_TYPE_MAP[obj.MimeType] || 'Unknown');
		var grouping;

		if (!type) { return; }

		if (obj.MimeType === 'application/vnd.nextthought.topic') {
			items.push(obj);
			return;
		}

		grouping = sections[type];

		if (!grouping) {
			grouping = sections[type] = {
				MimeType: 'application/vnd.nextthought.nticourseoverviewgroup',
				type: type,
				title: SECTION_TITLE_MAP[type] || type,
				accentColor: SECTION_COLOR_MAP[type] || 'ce78e0',
				Items: []
			};
			items.push(grouping);
		}


		if (type === 'video') {
			if (grouping.Items.length === 0) {
				grouping.Items.push({MimeType: 'application/vnd.nextthought.ntivideoset', Items: []});
			}
			grouping = grouping.Items[0];
		}

		grouping.Items.push(obj);
	});



	return {
	    MimeType: 'application/vnd.nextthought.ntilessonoverview',
	    NTIID: element.get('ntiid'),
		Items: items,
		title: element.get('label')
	};
};
