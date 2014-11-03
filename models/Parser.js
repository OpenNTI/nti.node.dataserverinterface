'use strict';

/* jshint -W101*/
var PARSERS = {
	'application/vnd.nextthought.user': require('./User'),
	'application/vnd.nextthought.pageinfo': require('./PageInfo'),

	'application/vnd.nextthought.assessment.assessedquestionset': require('./assessment/AssessedQuestionSet'),
	'application/vnd.nextthought.assessment.assessedquestion': require('./assessment/AssessedQuestion'),
	'application/vnd.nextthought.assessment.assessedpart': require('./assessment/AssessedPart'),

	'application/vnd.nextthought.naquestionset': require('./assessment/QuestionSet'),
	'application/vnd.nextthought.naquestion': require('./assessment/Question'),

	'application/vnd.nextthought.grade': require('./assessment/Grade'),
	'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback': require('./assessment/AssignmentFeedback'),

	'application/vnd.nextthought.change': require('./Change'),

	'application/vnd.nextthought.messageinfo': null,//Need To Model
	'application/vnd.nextthought.openbadges.badge': null//Need To Model
};



module.exports = function parser(service, parent, obj) {
	if (Array.isArray(obj)) {
		return obj.map(parser.bind(this, service));
	}
	var Cls = PARSERS[obj.MimeType];
	var args = [service];

	if (Cls && Cls.parse.length > 2) {
		args.push(parent);
	}

	args.push(obj);

	return (Cls && Cls.parse && Cls.parse.apply(Cls, args)) || error(obj);
};



function error(obj) {
	throw new Error('No Parser for object: ' + (obj && obj.MimeType));
}
