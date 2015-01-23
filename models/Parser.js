'use strict';

var ignored = {parse: require('../utils/identity')};

var PARSERS = {
	'user': require('./User'),
	'pageinfo': require('./PageInfo'),

	'ContentPackage': require('./content/Package'),
	'ContentPackageBundle': require('./content/Bundle'),

	'mediasource': require('./MediaSource'),
	'video': require('./Video'),
	'ntivideo': 'video',

	'videoindex-pagesource': require('./VideoIndexBackedPageSource'),

	'courses.catalogentry': require('./courses/CatalogEntry'),
	'courses.courseinstance': require('./courses/Instance'),
	'courses.courseenrollment': require('./courses/Enrollment'),
	'courses.courseoutlinenode': require('./courses/OutlineNode'),
	'courses.courseoutline': 'courses.courseoutlinenode',
	'courses.courseoutlinecontentnode': 'courses.courseoutlinenode',
	'courses.courseoutlinecalendarnode': 'courses.courseoutlinenode',

	'courses.coursecataloglegacyentry': 'courses.catalogentry',//Really?! Two packages?! :P
	'courseware.coursecataloglegacyentry': 'courses.catalogentry',

	'courses.legacycommunitybasedcourseinstance': 'courses.courseinstance',
	'courseware.courseinstanceenrollment':'courses.courseenrollment',


	'assessment.assessedquestionset': require('./assessment/AssessedQuestionSet'),
	'assessment.assessedquestion': require('./assessment/AssessedQuestion'),
	'assessment.assessedpart': require('./assessment/AssessedPart'),

	'naquestionset': require('./assessment/QuestionSet'),
	'naquestion': require('./assessment/Question'),
	'naquestionfillintheblankwordbank': 'naquestion',

	'assessment.assignment': require('./assessment/Assignment'),
	'assessment.timedassignment': require('./assessment/TimedAssignment'),

	'assessment.assignmentpart': require('./assessment/AssignmentPart'),

	'assessment.randomizedquestionset': 'naquestionset',
	'assessment.fillintheblankwithwordbankquestion': 'naquestion',

	'assessment.assignmentsubmission': require('./assessment/AssignmentSubmission'),
	'assessment.assignmentsubmissionpendingassessment': 'assessment.assignmentsubmission',
	'assessment.questionsetsubmission': require('./assessment/QuestionSetSubmission'),
	'assessment.questionsubmission': require('./assessment/QuestionSubmission'),

	'assessment.response': require('./assessment/Response'),
	'assessment.dictresponse': 'assessment.response',
	'assessment.textresponse': 'assessment.response',

	'assessment.part': require('./assessment/Part'),
	'assessment.solution': require('./assessment/Solution'),

	'assessment.hint': require('./assessment/Hint'),
	'assessment.htmlhint': 'assessment.hint',
	'assessment.texthint': 'assessment.hint',

	'assessment.filepart': require('./assessment/parts/File'),
	'assessment.fillintheblank': require('./assessment/parts/FillInTheBlank'),
	'assessment.fillintheblankshortanswerpart': 'assessment.fillintheblank',
	'assessment.fillintheblankwithwordbankpart': 'assessment.fillintheblank',
	'assessment.freeresponsepart': 'assessment.part',
	'assessment.matchingpart': require('./assessment/parts/Matching'),
	'assessment.mathpart': 'assessment.part',
	'assessment.modeledcontentpart': 'assessment.part',
	'assessment.multiplechoicepart': require('./assessment/parts/MultipleChoice'),
	'assessment.multiplechoicemultipleanswerpart': 'assessment.multiplechoicepart',
	'assessment.randomizedmultiplechoicepart': 'assessment.multiplechoicepart',
	'assessment.randomizedmultiplechoicemultipleanswerpart': 'assessment.multiplechoicepart',
	'assessment.numericmathpart': 'assessment.part',
	'assessment.orderingpart': 'assessment.part',
	'assessment.symbolicmathpart': 'assessment.part',

	'assessment.fillintheblankshortanswersolution': 'assessment.solution',
	'assessment.fillintheblankwithwordbanksolution': 'assessment.solution',
	'assessment.freeresponsesolution': 'assessment.solution',
	'assessment.latexsymbolicmathsolution': 'assessment.solution',
	'assessment.matchingsolution': 'assessment.solution',
	'assessment.mathsolution': 'assessment.solution',
	'assessment.multiplechoicemultipleanswersolution': 'assessment.solution',
	'assessment.multiplechoicesolution': 'assessment.solution',
	'assessment.numericmathsolution': 'assessment.solution',
	'assessment.orderingsolution': 'assessment.solution',
	'assessment.symbolicmathsolution': 'assessment.solution',

	'assessment.savepointitem': require('./assessment/SavePointItem'),
	'assessment.userscourseassignmentsavepointitem': 'assessment.savepointitem',

	'assessment.questionbank': ignored,
	'assessment.questionmap': ignored,

	'naqwordbank': require('./assessment/WordBank'),
	'naqwordentry': require('./assessment/WordEntry'),

	'grade': require('./assessment/Grade'),
	'assessment.assignmenthistoryitem': require('./assessment/AssignmentHistoryItem'),
	'assessment.userscourseassignmenthistoryitem': 'assessment.assignmenthistoryitem',
	'assessment.userscourseassignmenthistoryitemfeedback': require('./assessment/AssignmentFeedback'),
	'assessment.userscourseassignmenthistoryitemfeedbackcontainer': require('./assessment/AssignmentFeedbackContainer'),

	'change': require('./Change'),

	'forums.board': require('./forums/Board'),
	'forums.topic': require('./forums/Topic'),
	'forums.forum': require('./forums/Forum'),
	'forums.post': require('./forums/Post'),
	'forums.comment': require('./forums/Comment'),

	'forums.headlinepost': 'forums.post',
	'forums.headlinetopic': 'forums.topic',

	'forums.communityboard': 'forums.board',
	'forums.communityforum': 'forums.forum',
	'forums.communityheadlinetopic': 'forums.topic',
	'forums.communityheadlinepost': 'forums.post',
	'forums.communitytopic': 'forums.topic',

	'forums.contentboard': 'forums.board',
	'forums.contentforum': 'forums.forum',
	'forums.contentheadlinetopic': 'forums.topic',
	'forums.contentheadlinepost': 'forums.post',

	'forums.generalforumcomment': 'forums.comment',
	'forums.contentforumcomment': 'forums.comment',

	'messageinfo': null,//Need To Model
	'openbadges.badge': null//Need To Model
};


export function getModelByType(type) {
	type = type.replace(/^application\/vnd.nextthought./, '');
	var p = PARSERS[type];
	if (typeof p === 'string') {
		p = p !== type ? getModelByType(p) : undefined;
	}


	if (p && !p.parse) {
		p.parse = (p.prototype.constructor.length > 2) ?
			ConstructorFuncWithParent :
			ConstructorFunc;
	}

	return p;
}


export default function parser(service, parent, obj) {
	if (Array.isArray(obj)) {
		return obj.map(parser.bind(this, service, parent));
	}
	var Cls = getModelByType(getType(obj));
	var args = [service];

	if (Cls && Cls.parse.length > 2) {
		args.push(parent);
	}

	args.push(obj);

	return (Cls && Cls.parse && Cls.parse.apply(Cls, args)) || error(obj);
}


function getType(o) {
	return o.MimeType || o.mimeType || o.Class;
}


function error(obj) {
	var e = new Error('No Parser for object: ' + (obj && getType(obj)));
	e.NoParser = true;
	throw e;
}

//Default Constructors
function ConstructorFuncWithParent (service, parent, data) {
	return (this.prototype.isPrototypeOf(data)) ? data :
	new this(service, parent, data);
}


function ConstructorFunc (service, data) {
	return (this.prototype.isPrototypeOf(data)) ? data :
	new this(service, data);
}
