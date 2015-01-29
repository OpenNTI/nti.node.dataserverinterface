
import identity from '../utils/identity';

import Community from './Community';
import User from './User';
import PageInfo from './PageInfo';
import Change from './Change';
import ContentPackage from './content/Package';
import ContentBundle from './content/Bundle';

import MediaSource from './MediaSource';
import Video from './Video';
import VideoIndexBackedPageSource from './VideoIndexBackedPageSource';

import CourseCatalogEntry from './courses/CatalogEntry';
import CourseInstance from './courses/Instance';
import CourseEnrollment from './courses/Enrollment';
import CourseOutlineNode from './courses/OutlineNode';
import CourseOutline from './courses/Outline';

import AssessmentQuestionSet from './assessment/QuestionSet';
import AssessmentQuestion from './assessment/Question';

import AssessmentAssignment from './assessment/Assignment';
import AssessmentTimedAssignment from './assessment/TimedAssignment';
import AssessmentAssignmentPart from './assessment/AssignmentPart';

import AssessmentAssessedQuestionSet from './assessment/AssessedQuestionSet';
import AssessmentAssessedQuestion from './assessment/AssessedQuestion';
import AssessmentAssessedPart from './assessment/AssessedPart';

import AssessmentAssignmentSubmission from './assessment/AssignmentSubmission';
import AssessmentQuestionSetSubmission from './assessment/QuestionSetSubmission';
import AssessmentQuestionSubmission from './assessment/QuestionSubmission';

import AssessmentResponse from './assessment/Response';

import AssessmentPart from './assessment/Part';
import AssessmentSolution from './assessment/Solution';

import AssessmentHint from './assessment/Hint';

import AssessmentPartFile from './assessment/parts/File';
import AssessmentPartFillInTheBlank from './assessment/parts/FillInTheBlank';
import AssessmentPartMatching from './assessment/parts/Matching';
import AssessmentPartMultipleChoice from './assessment/parts/MultipleChoice';
import AssessmentPartOrdering from './assessment/parts/Ordering';

import AssessmentSavePointItem from './assessment/SavePointItem';

import AssessmentWordBank from './assessment/WordBank';
import AssessmentWordEntry from './assessment/WordEntry';

import AssessmentGrade from './assessment/Grade';
import AssessmentAssignmentHistoryItem from './assessment/AssignmentHistoryItem';
import AssessmentAssignmentFeedback from './assessment/AssignmentFeedback';
import AssessmentAssignmentFeedbackContainer from './assessment/AssignmentFeedbackContainer';

import ForumsBoard from './forums/Board';
import ForumsTopic from './forums/Topic';
import ForumsForum from './forums/Forum';
import ForumsPost from './forums/Post';
import ForumsComment from './forums/Comment';

const ignored = {parse: identity};

const PARSERS = {
	'link': ignored,
	'change': Change,

	'community': Community,
	'user': User,
	'pageinfo': PageInfo,

	'ContentPackage': ContentPackage,
	'ContentPackageBundle': ContentBundle,

	'mediasource': MediaSource,
	'video': Video,
	'ntivideo': 'video',

	'videoindex-pagesource': VideoIndexBackedPageSource,

	'courses.catalogentry': CourseCatalogEntry,
	'courses.courseinstance': CourseInstance,
	'courses.courseenrollment': CourseEnrollment,
	'courses.courseoutline': CourseOutline,
	'courses.courseoutlinenode': CourseOutlineNode,
	'courses.courseoutlinecontentnode': 'courses.courseoutlinenode',
	'courses.courseoutlinecalendarnode': 'courses.courseoutlinenode',

	'courses.coursecataloglegacyentry': 'courses.catalogentry',//Really?! Two packages?! :P
	'courseware.coursecataloglegacyentry': 'courses.catalogentry',

	'courses.legacycommunitybasedcourseinstance': 'courses.courseinstance',
	'courseware.courseinstanceenrollment':'courses.courseenrollment',


	'assessment.assessedquestionset': AssessmentAssessedQuestionSet,
	'assessment.assessedquestion': AssessmentAssessedQuestion,
	'assessment.assessedpart': AssessmentAssessedPart,

	'questionset': AssessmentQuestionSet,
	'naquestionset': 'questionset',
	'naquestionbank': 'questionset',
	'question': AssessmentQuestion,
	'naquestion': 'question',
	'naquestionfillintheblankwordbank': 'question',

	'assessment.assignment': AssessmentAssignment,
	'assessment.timedassignment': AssessmentTimedAssignment,

	'assessment.assignmentpart': AssessmentAssignmentPart,

	'assessment.randomizedquestionset': 'questionset',
	'assessment.fillintheblankwithwordbankquestion': 'question',

	'assessment.assignmentsubmission': AssessmentAssignmentSubmission,
	'assessment.assignmentsubmissionpendingassessment': 'assessment.assignmentsubmission',
	'assessment.questionsetsubmission': AssessmentQuestionSetSubmission,
	'assessment.questionsubmission': AssessmentQuestionSubmission,

	'assessment.response': AssessmentResponse,
	'assessment.dictresponse': 'assessment.response',
	'assessment.textresponse': 'assessment.response',

	'assessment.part': AssessmentPart,
	'assessment.solution': AssessmentSolution,

	'assessment.hint': AssessmentHint,
	'assessment.htmlhint': 'assessment.hint',
	'assessment.texthint': 'assessment.hint',

	'assessment.filepart': AssessmentPartFile,
	'assessment.fillintheblank': AssessmentPartFillInTheBlank,
	'assessment.fillintheblankshortanswerpart': 'assessment.fillintheblank',
	'assessment.fillintheblankwithwordbankpart': 'assessment.fillintheblank',
	'assessment.freeresponsepart': 'assessment.part',
	'assessment.matchingpart': AssessmentPartMatching,
	'assessment.mathpart': 'assessment.part',
	'assessment.modeledcontentpart': 'assessment.part',
	'assessment.multiplechoicepart': AssessmentPartMultipleChoice,
	'assessment.multiplechoicemultipleanswerpart': 'assessment.multiplechoicepart',
	'assessment.randomizedmultiplechoicepart': 'assessment.multiplechoicepart',
	'assessment.randomizedmultiplechoicemultipleanswerpart': 'assessment.multiplechoicepart',
	'assessment.numericmathpart': 'assessment.part',
	'assessment.orderingpart': AssessmentPartOrdering,
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

	'assessment.savepointitem': AssessmentSavePointItem,
	'assessment.userscourseassignmentsavepointitem': 'assessment.savepointitem',

	'assessment.questionbank': ignored,
	'assessment.questionmap': ignored,

	'naqwordbank': AssessmentWordBank,
	'naqwordentry': AssessmentWordEntry,

	'grade': AssessmentGrade,
	'assessment.assignmenthistoryitem': AssessmentAssignmentHistoryItem,
	'assessment.userscourseassignmenthistoryitem': 'assessment.assignmenthistoryitem',
	'assessment.userscourseassignmenthistoryitemfeedback': AssessmentAssignmentFeedback,
	'assessment.userscourseassignmenthistoryitemfeedbackcontainer': AssessmentAssignmentFeedbackContainer,

	'forums.board': ForumsBoard,
	'forums.topic': ForumsTopic,
	'forums.forum': ForumsForum,
	'forums.post': ForumsPost,
	'forums.comment': ForumsComment,

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


export function parse(service, parent, obj) {
	if (Array.isArray(obj)) {
		return obj.map(parse.bind(this, service, parent));
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
