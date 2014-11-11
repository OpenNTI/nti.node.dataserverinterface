'use strict';

var ignored = {parse: require('../utils/identity')};

var PARSERS = {
	'user': require('./User'),
	'pageinfo': require('./PageInfo'),

	'assessment.assessedquestionset': require('./assessment/AssessedQuestionSet'),
	'assessment.assessedquestion': require('./assessment/AssessedQuestion'),
	'assessment.assessedpart': require('./assessment/AssessedPart'),

	'naquestionset': require('./assessment/QuestionSet'),
	'naquestion': require('./assessment/Question'),

	'assessment.assignment': require('./assessment/Assignment'),

	'assessment.randomizedquestionset': 'naquestionset',
	'assessment.fillintheblankwithwordbankquestion': 'naquestion',

	'assessment.assignmentsubmission': require('./assessment/AssignmentSubmission'),
	'assessment.assignmentsubmissionpendingassessment': 'assessment.assignmentsubmission',

	'assessment.response': require('./assessment/Response'),
	'assessment.dictresponse': 'assessment.response',
	'assessment.textresponse': 'assessment.response',

	'assessment.part': require('./assessment/Part'),
	'assessment.solution': require('./assessment/Solution'),

	'assessment.hint': require('./assessment/Hint'),
	'assessment.htmlhint': 'assessment.hint',
	'assessment.texthint': 'assessment.hint',

	'assessment.filepart': require('./assessment/parts/File'),
	'assessment.fillintheblankshortanswerpart': 'assessment.part',
	'assessment.fillintheblankwithwordbankpart': 'assessment.part',
	'assessment.freeresponsepart': 'assessment.part',
	'assessment.matchingpart': 'assessment.part',
	'assessment.mathpart': 'assessment.part',
	'assessment.modeledcontentpart': 'assessment.part',
	'assessment.multiplechoicepart': 'assessment.part',
	'assessment.numericmathpart': 'assessment.part',
	'assessment.randomizedmultiplechoicepart': 'assessment.multiplechoicepart',
	'assessment.orderingpart': 'assessment.part',
	'assessment.symbolicmathpart': 'assessment.part',

	'assessment.fillintheblankshortanswersolution': 'assessment.solution',
	'assessment.fillintheblankwithwordbanksolution': 'assessment.solution',
	'assessment.freeresponsesolution': 'assessment.solution',
	'assessment.latexsymbolicmathsolution': 'assessment.solution',
	'assessment.matchingsolution': 'assessment.solution',
	'assessment.mathsolution': 'assessment.solution',
	'assessment.multiplechoicemultipleanswerpart': 'assessment.part',
	'assessment.multiplechoicemultipleanswersolution': 'assessment.solution',
	'assessment.multiplechoicesolution': 'assessment.solution',
	'assessment.numericmathsolution': 'assessment.solution',
	'assessment.orderingsolution': 'assessment.solution',
	'assessment.symbolicmathsolution': 'assessment.solution',

	'assessment.questionbank': ignored,
	'assessment.questionmap': ignored,

	'naqwordbank': require('./assessment/WordBank'),
	'naqwordentry': require('./assessment/WordEntry'),

	'grade': require('./assessment/Grade'),
	'assessment.userscourseassignmenthistoryitemfeedback': require('./assessment/AssignmentFeedback'),

	'change': require('./Change'),

	'messageinfo': null,//Need To Model
	'openbadges.badge': null//Need To Model
};


function getParser(type) {
	var p = PARSERS[type];
	if (typeof p === 'string') {
		p = p !== type ? getParser(p) : undefined;
	}
	return p;
}


module.exports = function parser(service, parent, obj) {
	if (Array.isArray(obj)) {
		return obj.map(parser.bind(this, service));
	}
	var Cls = getParser(obj.MimeType.replace(/^application\/vnd.nextthought./, ''));
	var args = [service];

	if (Cls && Cls.parse.length > 2) {
		args.push(parent);
	}

	args.push(obj);

	return (Cls && Cls.parse && Cls.parse.apply(Cls, args)) || error(obj);
};



function error(obj) {
	var e = new Error('No Parser for object: ' + (obj && obj.MimeType));
	e.NoParser = true;
	throw e;
}
