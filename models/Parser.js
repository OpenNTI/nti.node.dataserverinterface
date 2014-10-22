'use strict';

var PARSERS = {
	'application/vnd.nextthought.user': require('./User'),
	'application/vnd.nextthought.pageinfo': require('./PageInfo'),

	'application/vnd.nextthought.assessment.assessedquestionset': require('./assessment/AssessedQuestionSet'),
	'application/vnd.nextthought.assessment.assessedquestion': require('./assessment/AssessedQuestion'),
	'application/vnd.nextthought.assessment.assessedpart': require('./assessment/AssessedPart'),

	'application/vnd.nextthought.naquestionset': require('./assessment/QuestionSet'),
	'application/vnd.nextthought.naquestion': require('./assessment/Question')
};



module.exports = function parser(service, obj) {
	if (Array.isArray(obj)) {
		return obj.map(parser.bind(this, service));
	}
	var Cls = PARSERS[obj.MimeType];

	return Cls && Cls.parse(service, obj) || error(obj);
};



function error(obj) {
	throw new Error('No Parser for object: ' + (obj && obj.MimeType));
}
